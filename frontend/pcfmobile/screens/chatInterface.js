import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, Animated, Pressable } from 'react-native';
import { Button, IconButton, Switch, Menu } from 'react-native-paper';
import { Audio } from 'expo-av';
import theme from '../styles/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { ELEVEN_LABS_API_KEY } from '@env';

export default function ChatInterface({ route, navigation }) {
  const API_URL = 'http://172.20.10.6:8000';
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState();
  const [autoRead, setAutoRead] = useState(false);
  const [sound, setSound] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const scrollViewRef = useRef();
  const { book, characterName, characterIndex } = route.params;
  const [conversationHistory, setConversationHistory] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [micAnimation] = useState(new Animated.Value(1));
  const [characterMenuVisible, setCharacterMenuVisible] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const pulseAnimation = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const profileRef = useRef();
  
  // Determine if we're chatting with a specific character or the whole book
  const isCharacterChat = Boolean(characterName);
  console.log(characterName);
  const chatPartner = characterName || "Book";
  const chatRole = characterName || "assistant";

  const getCharacterAvatar = (bookId, charIndex) => {
    return `${API_URL}/rag_storage/${bookId}/characters/${charIndex}.png`;
  };

  useEffect(() => {
    // Initialize with a welcome message
    const welcomeMsg = isCharacterChat 
      ? `You are now chatting with ${characterName} from "${book.title}". Feel free to type or hold the mic button to speak.`
      : `Welcome! You can now chat about "${book.title}". Feel free to type or hold the mic button to speak.`;
    
    setMessages([{
      text: welcomeMsg,
      sender: 'bot'
    }]);
    
    setConversationHistory([{
      role: chatRole,
      content: welcomeMsg
    }]);
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function startRecording() {
    try {
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    try {
      console.log('Stopping recording..');
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      const uri = recording.getURI();
      console.log('Recording stopped and stored at', uri);
      
      // Create form data for the API request
      const formData = new FormData();
      formData.append('model_id', 'scribe_v1');
      
      // Add the audio file to form data
      formData.append('file', {
        uri: uri,
        type: 'audio/m4a', // or the appropriate mime type
        name: 'audio.m4a'
      });

      try {
        // Send to Eleven Labs API
        const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVEN_LABS_API_KEY,
            'Accept': 'application/json',
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Transcription:', data.text);

        // Add the transcribed text as a user message
        if (data.text) {
          await sendMessage(data.text);
        }

      } catch (error) {
        console.error('Error sending to Eleven Labs:', error);
        // Show error message to user
        setMessages(prev => [...prev, {
          text: "Sorry, there was an error processing your voice message.",
          sender: 'bot'
        }]);
      }
      
      setRecording(undefined);
      
      // Clean up the audio file
      try {
        await FileSystem.deleteAsync(uri);
      } catch (error) {
        console.error('Error cleaning up audio file:', error);
      }

    } catch (error) {
      console.error('Failed to stop recording', error);
      setRecording(undefined);
    }
  }

  const textToSpeech = async (text) => {
    try {
      const response = await fetch(
        "https://api.elevenlabs.io/v1/text-to-speech/TX3LPaxmHKxFdv7VOQHJ?output_format=mp3_44100_128",
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVEN_LABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2"
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the audio data as blob
      const audioBlob = await response.blob();
      
      // Create a temporary file path
      const tempFilePath = `${FileSystem.cacheDirectory}temp_audio.mp3`;
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];
        
        // Write the file
        await FileSystem.writeAsStringAsync(tempFilePath, base64data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Play the audio
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: tempFilePath },
          { shouldPlay: true }
        );
        
        setSound(newSound);

        // Clean up after playing
        newSound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.didJustFinish) {
            await newSound.unloadAsync();
            await FileSystem.deleteAsync(tempFilePath);
          }
        });
      };
    } catch (error) {
      console.error('Error with text-to-speech:', error);
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // Add user message to chat and conversation history
    const userMessage = { text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: text }
    ];
    setConversationHistory(updatedHistory);

    try {
      // Prepare request body based on chat type
      const requestBody = {
        book_id: book.uid,
        query: text,
        char_name: "",
        conv_hist: updatedHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };
      
      if (isCharacterChat) {
        requestBody.char_name = characterName;
      }

      // Debug logs
      console.log('API URL:', API_URL);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      // Configure axios with timeout and additional logging
      const axiosConfig = {
        timeout: 120000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        }
      };

      try {
        // Make API call with more detailed error handling
        const response = await axios.post(`${API_URL}/chat`, requestBody, axiosConfig);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        const botResponse = response.data;
        console.log('Bot response:', botResponse);
        
        // Add bot message to chat and conversation history
        const botMessage = {
          text: botResponse,
          sender: 'bot'
        };
        
        setMessages(prev => [...prev, botMessage]);
        setConversationHistory(prev => [...prev, {
          role: chatRole,
          content: botResponse
        }]);

        // If auto-read is enabled, convert bot message to speech
        // if (autoRead) {
          textToSpeech(botResponse);
        // }

      } catch (axiosError) {
        // Detailed axios error logging
        console.error('Axios error details:', {
          message: axiosError.message,
          code: axiosError.code,
          stack: axiosError.stack,
          config: {
            url: axiosError.config?.url,
            method: axiosError.config?.method,
            headers: axiosError.config?.headers,
            timeout: axiosError.config?.timeout,
          },
          response: axiosError.response ? {
            status: axiosError.response.status,
            statusText: axiosError.response.statusText,
            data: axiosError.response.data,
            headers: axiosError.response.headers,
          } : 'No response',
          isNetworkError: axiosError.isAxiosError && !axiosError.response,
        });

        // Check if it's a CORS issue
        if (axiosError.message.includes('CORS')) {
          console.error('Possible CORS issue detected');
        }

        // Check if it's a timeout
        if (axiosError.code === 'ECONNABORTED') {
          console.error('Request timed out');
        }

        // Check if it's a network connectivity issue
        if (!axiosError.response) {
          console.error('Network connectivity issue - no response received');
          console.log('Current network status:', navigator.onLine);
        }

        throw axiosError; // Re-throw to be caught by outer catch block
      }

    } catch (error) {
      console.error('Final error handler:', error);
      // Show error message in chat with more detail
      const errorMessage = {
        text: `Error: ${error.message}. Please check your connection and try again.`,
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setInputText('');
  };

  const toggleMenu = () => setMenuVisible(!menuVisible);

  const startPulseAnimation = () => {
    pulseAnimation.current = Animated.loop(
      Animated.sequence([
        Animated.timing(micAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(micAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.current.start();
  };

  const stopPulseAnimation = () => {
    if (pulseAnimation.current) {
      pulseAnimation.current.stop();
      Animated.timing(micAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleCharacterChange = (character, index) => {
    // First close the menu
    setCharacterMenuVisible(false);
    
    // Navigate to the new character chat
    navigation.replace('ChatInterface', {
      book,
      characterName: character.name,
      characterIndex: index,
      isCharacterChat: true
    });
  };

  const showCharacterMenu = () => {
    if (profileRef.current && isCharacterChat) {
      profileRef.current.measure((x, y, width, height, pageX, pageY) => {
        const centerX = pageX + (width / 2);
        setMenuPosition({
          x: centerX - 140,
          y: pageY + height + 8
        });
        setCharacterMenuVisible(true);
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <IconButton
              icon="arrow-left"
              size={28}
              iconColor={theme.colors.primary}
              style={styles.headerIcon}
              onPress={() => navigation.goBack()}
            />
          </View>
          
          <TouchableOpacity 
            ref={profileRef}
            style={styles.headerProfile}
            onPress={showCharacterMenu}
          >
            {isCharacterChat ? (
              <>
                <Image
                  source={{ 
                    uri: getCharacterAvatar(book.uid, characterIndex),
                    headers: { 'Accept': 'image/png' }
                  }}
                  defaultSource={require('../assets/default-avatar.png')}
                  style={styles.headerAvatar}
                />
                <Text style={styles.headerTitle}>{characterName}</Text>
              </>
            ) : (
              <Text style={styles.headerTitle}>{book.title}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <IconButton
              icon="waveform"
              size={35}
              iconColor={theme.colors.primary}
              style={styles.headerIcon}
              onPress={() => navigation.navigate('VoiceChat', { 
                book,
                characterName,
                characterIndex,
                isBookChat: !isCharacterChat
              })}
            />
          </View>

          <Menu
            visible={characterMenuVisible}
            onDismiss={() => setCharacterMenuVisible(false)}
            anchor={{ x: menuPosition.x, y: menuPosition.y }}
            contentStyle={[
              styles.characterMenu,
              { 
                transform: [{ scale: characterMenuVisible ? 1 : 0.9 }],
                
                marginHorizontal: 16,
              }
            ]}
          >
            {book.character_list.map((character, index) => (
              <Pressable
                key={index}
                onPress={() => handleCharacterChange(character, index)}
                style={({ pressed }) => [
                  styles.characterMenuItem,
                  pressed && { 
                    opacity: 0.7,
                    backgroundColor: theme.colors.primary + '20' // Add slight highlight
                  }
                ]}
              >
                <View style={styles.menuItemContent}>
                  <Image
                    source={{ 
                      uri: getCharacterAvatar(book.uid, index),
                      headers: { 'Accept': 'image/png' }
                    }}
                    defaultSource={require('../assets/default-avatar.png')}
                    style={styles.menuAvatar}
                  />
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuItemName}>{character.name}</Text>
                    <Text style={styles.menuItemDescription} numberOfLines={1}>
                      {character.desc}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </Menu>
        </View>
  
        <ScrollView 
          style={styles.messagesContainer}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message, index) => (
            <View 
              key={index} 
              style={[
                styles.messageRow,
                message.sender === 'user' ? styles.userMessageRow : styles.botMessageRow
              ]}
            >
              {message.sender === 'bot' && isCharacterChat && (
                <TouchableOpacity 
                  onPress={() => setCharacterMenuVisible(true)}
                  style={styles.avatarContainer}
                >
                  <Image
                    source={{ 
                      uri: getCharacterAvatar(book.uid, characterIndex),
                      headers: { 'Accept': 'image/png' }
                    }}
                    defaultSource={require('../assets/default-avatar.png')}
                    style={styles.messageAvatar}
                  />
                </TouchableOpacity>
              )}
              <View 
                style={[
                  styles.messageBubble,
                  message.sender === 'user' ? styles.userMessage : styles.botMessage
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.sender === 'user' ? styles.userMessageText : styles.botMessageText
                ]}>
                  {message.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
  
        {/* INPUT SECTION */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={theme.colors.placeholder}
            keyboardAppearance="dark"
          />
          <TouchableOpacity
            onPressIn={() => {
              startRecording();
              startPulseAnimation();
            }}
            onPressOut={() => {
              stopRecording();
              stopPulseAnimation();
            }}
            activeOpacity={0.7}
          >
            <Animated.View style={{ transform: [{ scale: micAnimation }] }}>
              <IconButton
                icon={recording ? "microphone" : "microphone-outline"}
                size={24}
                iconColor={recording ? theme.colors.error : theme.colors.primary}
                style={[
                  styles.micButton,
                  { borderColor: theme.colors.primary, borderWidth: 1 }
                ]}
              />
            </Animated.View>
          </TouchableOpacity>
          <IconButton
            icon="send"
            size={24}
            iconColor={inputText.trim() ? theme.colors.cardText : theme.colors.text}
            style={[
              styles.sendButton,
              inputText.trim() && { 
                backgroundColor: theme.colors.primary,
                transform: [] // Remove rotation when active
              }
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceVariant,
    backgroundColor: theme.colors.surface,
    height: 120,
  },
  headerLeft: {
    width: 60,
    justifyContent: 'center',
  },
  headerProfile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
    backgroundColor: theme.colors.surfaceVariant,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'WorkSans-Medium',
    color: theme.colors.text,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 4,
  },
  userMessage: {
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  botMessage: {
    backgroundColor: theme.colors.surface,
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.25,
    fontFamily: 'WorkSans-Regular',
  },
  userMessageText: {
    color: theme.colors.cardText,
  },
  botMessageText: {
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceVariant,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.text,
    letterSpacing: 0.25,
    fontFamily: 'WorkSans-Regular',
  },
  micButton: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 4,
  },
  sendButton: {
    marginLeft: 8,
    marginBottom: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 4,
  },
  avatarContainer: {
    marginTop: 16,
    marginRight: 8,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceVariant,
  },
  menuContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    marginTop: 8,
  },
  menuItem: {
    paddingRight: 16,
  },
  characterMenu: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    minWidth: 280,
    width: '90%',
    alignSelf: 'center',
    padding: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.colors.surfaceVariant,
    top: 1,
    zIndex: 1000,
  },
  characterMenuItem: {
    height: 72,
    marginVertical: 4,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.roundness,
    overflow: 'hidden',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    height: '100%',
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: theme.colors.surface,
  },
  menuTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  menuItemName: {
    fontSize: 16,
    fontFamily: 'WorkSans-SemiBold',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 14,
    fontFamily: 'WorkSans-Regular',
    color: theme.colors.text,
    opacity: 0.8,
  },
  menuIcon: {
    color: theme.colors.primary,
  },
  headerIcon: {
    margin: 0,
    backgroundColor: 'transparent',
  },
}); 
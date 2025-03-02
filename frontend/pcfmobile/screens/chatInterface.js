import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, IconButton, Switch } from 'react-native-paper';
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
  const { book, characterId, characterName } = route.params;
  const [conversationHistory, setConversationHistory] = useState([]);
  
  // Determine if we're chatting with a specific character or the whole book
  const isCharacterChat = Boolean(characterName);
  const chatPartner = characterName || "Book";
  const chatRole = characterName || "assistant";

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
        "https://api.elevenlabs.io/v1/text-to-speech/cgSgspJ2msm6clMCkdW9?output_format=mp3_44100_128",
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
        if (autoRead) {
          textToSpeech(botResponse);
        }

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

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>{book.title}</Text>
          <View style={styles.autoReadContainer}>
            <Text style={styles.autoReadText}>Auto-read</Text>
            <Switch
              value={autoRead}
              onValueChange={setAutoRead}
              color={theme.colors.primary}
            />
          </View>
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
                styles.messageBubble,
                message.sender === 'user' ? styles.userMessage : styles.botMessage
              ]}
            >
              <Text style={styles.messageText}>{message.text}</Text>
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
            style={styles.micButton}
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <IconButton
              icon={recording ? "microphone" : "microphone-outline"}
              size={24}
              iconColor={recording ? theme.colors.error : theme.colors.cardText}
            />
          </TouchableOpacity>
          <IconButton
            icon="send"
            size={24}
            iconColor={theme.colors.cardText}
            style={[
              styles.sendButton,
              { opacity: !inputText.trim() ? 0.5 : 1 }
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
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: 'bold',
    position: 'absolute', // Ensure it stays centered
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  userMessage: {
    backgroundColor: theme.colors.primary,
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: theme.colors.surface,
    alignSelf: 'flex-start',
  },
  messageText: {
    color: theme.colors.cardText,
  },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.surface,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 8,
      width: '100%',  // Ensures it takes full width
    },
    input: {
      flex: 1,  // Takes as much space as possible
      backgroundColor: 'transparent',
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.colors.text,
    },
    micButton: {
      marginLeft: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButton: {
      marginLeft: 5,
      transform: [{ rotate: '-35deg' }],
      marginBottom: 12,
    },
  autoReadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 10,
  },
  autoReadText: {
    color: theme.colors.text,
    marginRight: 8,
    fontSize: 12,
  },
}); 
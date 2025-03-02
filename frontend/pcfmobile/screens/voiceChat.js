import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Image } from 'react-native';
import { IconButton } from 'react-native-paper';
import theme from '../styles/theme';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { ELEVEN_LABS_API_KEY } from '@env';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function VoiceChat({ route, navigation }) {
  const [recording, setRecording] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [textVisible, setTextVisible] = useState(false);
  const [sound, setSound] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  // Animation values
  const listeningAnimation = useRef(new Animated.Value(1)).current;
  const thinkingAnimation = useRef(new Animated.Value(1)).current;
  const speakingAnimation = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const overlayAnimation1 = useRef(new Animated.Value(0)).current;
  const overlayAnimation2 = useRef(new Animated.Value(0)).current;

  const { book, characterName, characterIndex } = route.params;
  const isCharacterChat = Boolean(characterName && characterIndex != null);
  const API_URL = 'http://172.20.10.6:8000';

  // Wobble animations
  const startListeningAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(listeningAnimation, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(listeningAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startThinkingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(thinkingAnimation, {
          toValue: 1.15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(thinkingAnimation, {
          toValue: 0.9,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startSpeakingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(speakingAnimation, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(speakingAnimation, {
          toValue: 0.95,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const showTranscribedText = (text) => {
    setTranscribedText(text);
    setTextVisible(true);
    Animated.sequence([
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setTextVisible(false));
  };

  const startBackgroundAnimation = () => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(overlayAnimation1, {
            toValue: 1,
            duration: 15000,
            useNativeDriver: true,
          }),
          Animated.timing(overlayAnimation1, {
            toValue: 0,
            duration: 15000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(overlayAnimation2, {
            toValue: 1,
            duration: 18000,
            useNativeDriver: true,
          }),
          Animated.timing(overlayAnimation2, {
            toValue: 0,
            duration: 18000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  };

  async function startRecording() {
    try {
      if (!permissionResponse.granted) {
        await requestPermission();
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      startListeningAnimation();
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(undefined);
      
      setThinking(true);
      startThinkingAnimation();

      // First convert speech to text using Eleven Labs
      const formData = new FormData();
      formData.append('model_id', 'scribe_v1');
      formData.append('file', {
        uri: uri,
        type: 'audio/m4a',
        name: 'audio.m4a'
      });

      const transcriptionResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_LABS_API_KEY,
          'Accept': 'application/json',
        },
        body: formData
      });

      const transcriptionData = await transcriptionResponse.json();
      
      if (transcriptionData.text) {
        showTranscribedText(transcriptionData.text);

        // Send to chat endpoint
        const chatResponse = await axios.post(`${API_URL}/chat`, {
          book_id: book.uid,
          query: transcriptionData.text,
          char_name: characterName || "",
          conv_hist: []
        });

        const botResponse = chatResponse.data;
        
        // Start speaking animation
        setThinking(false);
        setSpeaking(true);
        startSpeakingAnimation();

        // Play the response
        await textToSpeech(botResponse);
        
        // Stop speaking animation after audio finishes
        setSpeaking(false);
      }
    } catch (err) {
      console.error('Failed to process voice chat:', err);
      setThinking(false);
      setSpeaking(false);
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

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    startBackgroundAnimation();
  }, []);

  // Add Audio mode setup at component mount
  useEffect(() => {
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });
    };
    setupAudio();
  }, []);

  return (
    <View style={styles.container}>
      {!isCharacterChat && (
        <View style={styles.backgroundContainer}>
          <Image
            source={require('../assets/default-book-cover.png')}
            style={styles.backgroundImage}
            blurRadius={20}
          />
          <Animated.View
            style={[
              styles.overlay1,
              {
                transform: [
                  {
                    translateX: overlayAnimation1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-300, 300],
                    }),
                  },
                  {
                    translateY: overlayAnimation1.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-300, 300],
                    }),
                  },
                  {
                    rotate: overlayAnimation1.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
                opacity: 0.4,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.overlay2,
              {
                transform: [
                  {
                    translateX: overlayAnimation2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, -300],
                    }),
                  },
                  {
                    translateY: overlayAnimation2.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, -300],
                    }),
                  },
                  {
                    rotate: overlayAnimation2.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['360deg', '0deg'],
                    }),
                  },
                ],
                opacity: 0.3,
              },
            ]}
          />
        </View>
      )}

      <IconButton
        icon="arrow-left"
        size={24}
        iconColor={theme.colors.primary}
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      />
      
      <View style={styles.avatarContainer}>
        <Animated.View
          style={[
            styles.avatarOuter,
            {
              transform: [
                { scale: recording ? listeningAnimation : thinking ? thinkingAnimation : speakingAnimation }
              ]
            }
          ]}
        >
          <View style={styles.avatarInner}>
            <Image
              source={{ 
                uri: `${API_URL}/rag_storage/${book.uid}/characters/${characterIndex}.png`,
                headers: { 'Accept': 'image/png' }
              }}
              defaultSource={require('../assets/default-avatar.png')}
              style={styles.avatar}
            />
          </View>
        </Animated.View>
      </View>

      {textVisible && (
        <Animated.View style={[styles.transcribedTextContainer, { opacity: textOpacity }]}>
          <Text style={styles.transcribedText}>{transcribedText}</Text>
        </Animated.View>
      )}

      <View style={styles.controls}>
        <IconButton
          icon="microphone"
          size={32}
          iconColor={recording ? theme.colors.error : theme.colors.primary}
          style={[
            styles.micButton,
            recording && styles.micButtonActive
          ]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#ffffff10',
    borderRadius: 20,
  },
  avatarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOuter: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 15,
      height: 15,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  avatarInner: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: theme.colors.background,
    padding: 15,
    shadowColor: '#fff',
    shadowOffset: {
      width: -8,
      height: -8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.3,
  },
  transcribedTextContainer: {
    position: 'absolute',
    top: 100,
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: theme.roundness,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 5,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  transcribedText: {
    color: theme.colors.text,
    fontFamily: 'WorkSans-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  controls: {
    marginBottom: 40,
  },
  micButton: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.background,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: theme.colors.background,
    shadowColor: theme.colors.error,
    shadowOpacity: 0.4,
  },
  backgroundContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.5,
  },
  overlay1: {
    position: 'absolute',
    width: 600,
    height: 600,
    backgroundColor: theme.colors.primary,
    borderRadius: 300,
    top: '50%',
    left: '50%',
    marginLeft: -300,
    marginTop: -300,
  },
  overlay2: {
    position: 'absolute',
    width: 500,
    height: 500,
    backgroundColor: theme.colors.secondary,
    borderRadius: 250,
    top: '50%',
    left: '50%',
    marginLeft: -250,
    marginTop: -250,
  },
}); 
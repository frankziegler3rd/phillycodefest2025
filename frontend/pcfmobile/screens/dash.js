import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Button, Card, useTheme, IconButton } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../styles/theme';

// Todo: favorite conversations

export default function Dash({ navigation }) {

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = 'http://172.20.10.6:8000'
  const theme = useTheme();

  const UploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.type === 'cancel') {
        console.log("User cancelled the document picker.");
      } else {
        console.log("Document selected:", result.uri);
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  // AXIOS GET HERE
  const getBooks = async () => {
    try {
      const response = await axios.get(API_URL);
      setBooks(response.data);
    } catch (err) {
      setError(err.message);
      console.log(err.message)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBooks();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#4e63bb" />;
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  return (
    <SafeAreaView style={[styles.safeContainer, {backgroundColor: theme.colors.background}]}>
      <View style={styles.header}>
        <IconButton icon="menu" size={24} color={theme.colors.text} />
        <Text style={styles.headerTitle}>BookCrunch</Text>
        <IconButton icon="view-grid" size={24} color={theme.colors.text} />
      </View>

      <ScrollView style={styles.container}>
        {books.map((book) => (
          <Card 
            key={book.title} 
            style={styles.bookCard}
            onPress={() => navigation.navigate('BookChat', { book })}
          >
            <View style={styles.cardContent}>
              <View style={styles.bookCoverContainer}>
                <Image
                  source={require('../assets/default-book-cover.png')}
                  defaultSource={require('../assets/default-book-cover.png')}
                  style={styles.bookCover}
                />
                <View style={styles.characterAvatars}>
                  {book.character_list.slice(0, 3).map((character, index) => (
                    <Image
                      key={index}
                      source={{ 
                        uri: `${API_URL}/rag_storage/${book.uid}/characters/${index}.png`,
                        headers: {
                          'Accept': 'image/png'
                        }
                      }}
                      defaultSource={require('../assets/default-avatar.png')}
                      style={[
                        styles.characterAvatar,
                        { right: index * 20 } // Stack avatars with overlap
                      ]}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle}>{book.title}</Text>
                <View style={styles.descriptionContainer}>
                  <Text style={styles.bookDescription} numberOfLines={3}>
                    {book.summary}
                  </Text>
                  <View style={styles.actionButtons}>
                    <IconButton
                      icon="microphone"
                      mode="contained"
                      containerColor={theme.colors.primary}
                      iconColor={theme.colors.cardText}
                      size={24}
                      onPress={() => navigation.navigate('VoiceChat', { 
                        book,
                        characterName: null,
                        characterIndex: null,
                        isBookChat: true
                      })}
                      style={styles.actionButton}
                    />
                    <IconButton
                      icon="chat-processing"
                      mode="contained"
                      containerColor={theme.colors.primary}
                      iconColor={theme.colors.cardText}
                      size={24}
                      onPress={() => navigation.navigate('ChatInterface', { book })}
                      style={styles.actionButton}
                    />
                  </View>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>

      <Button 
        mode="contained"
        buttonColor={theme.colors.primary}
        textColor={theme.colors.cardText}
        onPress={UploadFile}
        icon='cloud-upload'
        style={styles.uploadButton}
      >
        Upload a novel
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'WorkSans-SemiBold',
    color: theme.colors.text,
  },
  welcomeBanner: {
    backgroundColor: theme.colors.surface,
    margin: 16,
    padding: 16,
    borderRadius: theme.roundness,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: theme.colors.secondary,
    borderWidth: 1,
  },
  welcomeText: {
    flex: 1,
    fontFamily: 'WorkSans-Regular',
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  bookCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: 16,
    borderRadius: theme.roundness,
    overflow: 'hidden',
    borderColor: theme.colors.secondary,
    borderWidth: 1,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  bookCoverContainer: {
    position: 'relative', // For absolute positioning of avatars
    width: 100,
    height: 150,
  },
  bookCover: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceVariant,
  },
  characterAvatars: {
    position: 'absolute',
    bottom: 34,
    right: -13,
    flexDirection: 'row',
  },
  characterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.background,
    position: 'absolute',
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
    height: 150,
  },
  descriptionContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  bookTitle: {
    fontSize: 18,
    fontFamily: 'WorkSans-SemiBold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  bookDescription: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'WorkSans-Regular',
    color: theme.colors.text,
    opacity: 0.8,
    lineHeight: 20,
  },
  actionButtons: {
    justifyContent: 'flex-start', // Align buttons to top
    gap: 8,
  },
  actionButton: {
    margin: 0,
  },
  uploadButton: {
    margin: 16,
    borderRadius: theme.roundness,
  },
});

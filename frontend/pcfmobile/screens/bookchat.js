import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Image } from 'react-native';
import { Button } from 'react-native-paper';
import theme from '../styles/theme';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookChat() {

  const route = useRoute();
  const navigation = useNavigation();
  const { book } = route.params || {};
  const API_URL = 'http://172.20.10.6:8000';

  const getCharacterAvatar = (bookId, charIndex) => {
    return `${API_URL}/rag_storage/${bookId}/characters/${charIndex}.png`;
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{book.title}</Text>
        
        <View style={[styles.section, {
          borderColor: theme.colors.secondary,
          borderWidth: 1,
        }]}>
          <Text style={styles.summaryText}>{book.summary}</Text>
          
          <Button 
            mode="contained" 
            buttonColor={theme.colors.primary}
            textColor={theme.colors.cardText}
            icon='book-education'
            onPress={() => navigation.navigate('ChatInterface', { book })}
            style={styles.button}>
            Talk to book
          </Button>
        </View>
        
        <Text style={styles.sectionTitle}>Characters:</Text>
        {book.character_list.map((character, index) => (
          <View 
            key={character.name || index} 
            style={[styles.characterContainer, {
              borderColor: theme.colors.secondary,
              borderWidth: 1,
            }]}
          >
            <Image 
              source={{ 
                uri: getCharacterAvatar(book.uid, index),
                headers: {
                  'Accept': 'image/png'
                }
              }}
              defaultSource={require('../assets/default-avatar.png')}
              style={styles.avatar}
            />
            <View style={styles.characterInfo}>
              <Text style={styles.characterTitle}>{character.name}</Text>
              <Text style={styles.characterDescription}>{character.desc}</Text>
            </View>
            <Button 
              mode="contained" 
              buttonColor={theme.colors.primary}
              textColor={theme.colors.cardText}
              icon='chat-processing'
              onPress={() => navigation.navigate('ChatInterface', { 
                book,
                characterName: character.name,
                characterIndex: index
              })}
              style={styles.button}>
              Chat
            </Button>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'WorkSans-SemiBold',
    color: theme.colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: theme.roundness,
    marginBottom: 24,
    elevation: 2,
  },
  summaryText: {
    fontSize: 16,
    fontFamily: 'WorkSans-Regular',
    color: theme.colors.text,
    marginBottom: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'WorkSans-SemiBold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  characterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: theme.roundness,
    marginBottom: 12,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceVariant,
    marginRight: 12,
  },
  characterInfo: {
    flex: 1,
    marginRight: 12,
  },
  characterTitle: {
    fontFamily: 'WorkSans-Medium',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  characterDescription: {
    fontFamily: 'WorkSans-Regular',
    color: theme.colors.text,
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
  },
});

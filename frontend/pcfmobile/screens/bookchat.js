import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import theme from '../styles/theme';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookChat() {

  const route = useRoute();
  const navigation = useNavigation();
  const { book } = route.params || {};
  console.log(book)

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{book.title}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{book.summary}</Text>
          
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
        <View key={character.name || index} style={styles.characterContainer}>
          <View style={styles.avatar} />
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
              characterName: character.name
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
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 10,
  },
  textBox: {
    minHeight: 60,
    backgroundColor: theme.colors.surface,
    borderRadius: 5,
    padding: 10,
    color: theme.colors.onSurface,
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  characterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.disabled,
    marginRight: 10,
  },
  characterInfo: {
    flex: 1,
  },
  characterTitle: {
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 5,
  },
  characterDescription: {
    color: '#FFFFFF', 
    fontSize: 14,
    marginTop: 5,
  },
});

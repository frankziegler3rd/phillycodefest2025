import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import theme from '../styles/theme';

export default function BookChat({ book }) {

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{book.title}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary:</Text>
        
        <Button mode="contained" buttonColor={theme.colors.primary} textColor={theme.colors.cardText} style={styles.button}>
          Talk to book
        </Button>
      </View>
      
      <Text style={styles.sectionTitle}>Characters:</Text>
      {books.characterList.map((_, index) => (
        <View key={index} style={styles.characterContainer}>
          <View style={styles.avatar} />
          <View style={styles.characterInfo}>
            <Text style={styles.characterTitle}>Character:</Text>
            
          </View>
          <Button mode="contained" buttonColor={theme.colors.primary} textColor={theme.colors.cardText} style={styles.button}>
            Chat
          </Button>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
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
});

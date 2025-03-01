import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Card, useTheme } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

const favoriteConversations = [
  { id: '1', title: 'Conversation with Alice', description: 'Discussing the latest trends in technology.' },
  { id: '2', title: 'Conversation with Bob', description: 'A deep dive into space exploration.' },
];

export default function Dash({ navigation }) {

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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


  /*
  * Expects and stores a JSON object of the form:
  * { "books" : 
  *   [ {"title" : "Great Gatsby",
  *      "Summary" : "...", 
  *      "characterList" :
  *         [ { charName : "Daisy Buchanon", "charSummary" : "...", ...}, ... ]
  *     }
  *   ]
  */
  const getBooks = async () => {
    try {
      // Simulating API request
      // const response = await axios.get('/API_URL');
      // setBooks(response.data);
  
      setBooks(
        [
          { id: 1,
            title: "Great Gatsby", 
            summary: "Eh yo my name is fuckin Gatsby I'm walkin eaaaaaa", 
            characterList: [
              { charName: "Daisy Buchanon", charSummary: "..." }
            ]
          }
        ]
      );
  
    } catch (err) {
      setError(err.message);
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
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: theme.colors.onSurface }]}>Hello John Doe!</Text>
        <Button 
          mode="contained"
          buttonColor={theme.colors.primary}
          textColor={theme.colors.cardText}
          onPress={UploadFile}
          style={styles.uploadButton}
        >
          Upload a novel
        </Button>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: theme.colors.onSurface }]}>My Novels</Text>
        {books.map((book) => (
          <Card key={book.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}
                onPress={() => navigation.navigate('BookChat', { book })}>
            <Card.Content>
              <Text style={[styles.cardTitle, { color: theme.colors.cardText }]}>{book.title}</Text>
              <Text style={[styles.cardDescription, { color: theme.colors.cardText }]}>{book.summary}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionHeader, { color: theme.colors.onSurface }]}>Favorite Conversations</Text>
        {favoriteConversations.map((conversation) => (
          <Card key={conversation.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}> 
            <Card.Content>
              <Text style={[styles.cardTitle, { color: theme.colors.cardText }]}>{conversation.title}</Text>
              <Text style={[styles.cardDescription, { color: theme.colors.cardText }]}>{conversation.description}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  uploadButton: {
    marginTop: 20,
    width: '60%',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
  },
});

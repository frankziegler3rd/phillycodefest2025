import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Button, Card, useTheme } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
        <View style={styles.header}>
          <Text style={[styles.headerText, { color: theme.colors.onSurface }]}>Hi, you</Text>
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
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.colors.onSurface }]}>My Novels</Text>
          {books.map((book) => (
            <Card key={book.title} style={[styles.card, { backgroundColor: theme.colors.surface }]}
                  onPress={() => navigation.navigate('BookChat', { book })}>
              <Card.Content>
                <Text style={[styles.cardTitle, { color: theme.colors.cardText }]}>{book.title}</Text>
                <Text style={[styles.cardDescription, { color: theme.colors.cardText }]}>
                  {book.summary.length > 50 ? book.summary.slice(0, 50) + "..." : book.summary}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
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

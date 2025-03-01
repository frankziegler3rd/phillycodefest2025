import * as React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { PaperProvider, Card, Title, Paragraph, Button } from 'react-native-paper';

const theme = {
  dark: false,
  colors: {
    primary: 'blue',
    accent: 'yellow',
    background: 'white',
    surface: 'white',
    text: 'black',
    disabled: '#f1f1f1',
  },
};

// Mock data for novels
const novels = [
  { id: '1', title: 'The Great Adventure', description: 'A thrilling journey through unknown lands.' },
  { id: '2', title: 'Mystery at the Castle', description: 'A mystery story set in a haunted castle.' },
  { id: '3', title: 'The Lost Kingdom', description: 'An ancient kingdom rediscovered after centuries.' },
];

// User Dashboard Screen
export default function dash() {
  return (
    <View style={styles.container}>
      {/* Display User Name */}
      <Text style={styles.header}>John Doe</Text>

      {/* My Novels Section */}
      <Text style={styles.sectionHeader}>My Novels</Text>

      <FlatList
        data={novels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{item.title}</Title>
              <Paragraph>{item.description}</Paragraph>
              <Button mode="contained" onPress={() => alert(`Opening ${item.title}`)}>
                Read More
              </Button>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    marginBottom: 15,
  },
});

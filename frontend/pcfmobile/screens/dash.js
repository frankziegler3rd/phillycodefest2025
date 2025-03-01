import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';


export default function Dash() {

  const { colors } = useTheme();

  const UploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      
      // Check if user picked a file or cancelled
      if (result.type === 'cancel') {
        console.log("User cancelled the document picker.");
      } else {
        console.log("Document selected:", result.uri); // Prints the file URI
        console.log(result); // Prints the entire result object
      }
    } catch (error) {
      console.error("Error picking document:", error);
    }
  };

  return (
      <View style={styles.container}>
          <Button 
              mode='outlined'
              onPress={UploadFile}>
                  Upload a novel.
          </Button>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
  },
})
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Button } from 'react-native-paper';

export default function Home() {
  return (
    <View style={styles.container}>
        <Text style={styles.text}>Welcome to bkcrunch!</Text>
        <LottieView
            source={require('../assets/bookOpening.json')} // Path to the animation
            autoPlay  // Starts the animation automatically
            loop      // Loops the animation
            style={{width: 450, height: 450}} // Optional: Add styling to control size, etc.
        />
        <Button mode='contained'>Get started</Button>
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
});
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Button, useTheme } from 'react-native-paper';
import dash from './dash';

export default function Home({ navigation }) {

    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.text, { color: colors.text }]}>
                Welcome to bkcrunch!
            </Text>
            <LottieView
                source={require('../assets/bookOpening.json')} // Path to the animation
                autoPlay  // Starts the animation automatically
                loop      // Loops the animation
                style={{width: 450, height: 450}} 
            />
            <Button 
                mode='outlined'
                onPress={() => navigation.navigate('dash')}>
                    Get started
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
});
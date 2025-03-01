import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Button, useTheme } from 'react-native-paper';

export default function Home({ navigation }) {

    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.headerText, { color: colors.text }]}>
                Welcome to NAMETBD!
            </Text>
            <LottieView
                source={require('../assets/bookOpening.json')} 
                autoPlay  
                loop      
                style={{width: 450, height: 450}} 
            />
            <Button 
                mode='outlined'
                onPress={() => navigation.navigate('Dash')}>
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});
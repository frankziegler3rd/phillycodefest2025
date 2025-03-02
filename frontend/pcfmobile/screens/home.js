import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Button, useTheme } from 'react-native-paper';
import theme from '../styles/theme';

export default function Home({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={[styles.headerText, styles.centerText]}>
                Welcome to Book Crunch.
            </Text>
            <LottieView
                source={require('../assets/bookOpening.json')} 
                autoPlay  
                loop      
                style={styles.lottieAnimation} 
            />
            <Text style={[styles.subHeaderText, styles.centerText]}>
                Learn everything there is to know about your favorite books by interacting with actual generated characters from it!
            </Text>
            <Button 
                mode="contained"
                buttonColor={theme.colors.primary}
                textColor={theme.colors.cardText}
                icon='book-open-variant'
                onPress={() => navigation.navigate('Dash')}
            >
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
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
  },
  centerText: {
    textAlign: 'center',
  },
  lottieAnimation: {
    width: 450, 
    height: 450, 
  },
  headerText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subHeaderText: {
    fontSize: 30,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: 20
  },
  button: {
    marginTop: 40,
    width: '60%',
  },
});

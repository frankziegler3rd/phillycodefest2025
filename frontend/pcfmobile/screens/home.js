import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Button, useTheme } from 'react-native-paper';
import theme from '../styles/theme';

export default function Home({ navigation }) {
    const colorFilter = {
      keypath: "**",
      color: theme.colors.primary
    };

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
                colorFilters={[colorFilter]}
            />
            <Text style={[styles.subHeaderText, styles.centerText]}>
                Your AI reading companion
            </Text>
            <Button
                mode="contained"
                onPress={() => navigation.navigate('Dash')}
                style={styles.button}
                textColor={theme.colors.cardText}
            >
                Get Started
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    centerText: {
        textAlign: 'center',
    },
    headerText: {
        fontSize: 40,
        fontFamily: 'WorkSans-SemiBold',
        color: theme.colors.text,
    },
    subHeaderText: {
        fontSize: 30,
        color: theme.colors.text,
        fontFamily: 'WorkSans-Medium',
        marginBottom: 20
    },
    button: {
        marginTop: 40,
        width: '60%',
    },
    lottieAnimation: {
        width: 300,
        height: 300,
    },
});

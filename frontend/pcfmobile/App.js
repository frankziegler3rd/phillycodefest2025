import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import Home from './screens/home.js';
import Theme from './styles/theme.js';
import Dash from './screens/dash'
import BookChat from './screens/bookchat';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ChatInterface from './screens/chatInterface';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <PaperProvider theme={Theme}>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name='Home' component={Home} options={{ headerShown: false }}/>
          <Stack.Screen name='Dash' component={Dash} options={{ headerShown: false }}/>
          <Stack.Screen name='BookChat' component={BookChat} options={{ headerShown: false }}/>
          <Stack.Screen name='ChatInterface' component={ChatInterface} options={{ headerShown: false }}/>
        </Stack.Navigator>
      </PaperProvider>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

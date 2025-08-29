import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Text, View } from 'react-native';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import MatchesScreen from './src/screens/MatchesScreen';
import ChatScreen from './src/screens/ChatScreen';

// Import context providers
import { AuthProvider } from './src/context/AuthContext';
import { RoleProvider } from './src/context/RoleContext';

// Import Redux store
import { store, persistor } from './src/store/index';

const Stack = createStackNavigator();

// Loading component for PersistGate
const Loading = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Loading...</Text>
  </View>
);

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <SafeAreaProvider>
          <AuthProvider>
            <RoleProvider>
              <NavigationContainer>
                <Stack.Navigator initialRouteName="Login">
                  <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
                  <Stack.Screen name="Signup" component={SignupScreen} options={{headerShown: false, gestureEnabled: true}} />
                  <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}} />
                  <Stack.Screen name="Matches" component={MatchesScreen} options={{headerShown: false}} />
                  <Stack.Screen name="Chat" component={ChatScreen} options={{headerShown: false}} />
                </Stack.Navigator>
              </NavigationContainer>
            </RoleProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;

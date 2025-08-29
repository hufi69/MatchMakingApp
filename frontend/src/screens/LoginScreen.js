import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient'; //ui layout use
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleContinue = async () => {
    setError('');
    
    // Email validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address (e.g., user@gmail.com)');
      return;
    }
    
    // Password validation
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    try {
      const result = await login({ email, password });
      
      if (result.success) {
        navigation.reset({index: 0, routes: [{name: 'Home'}]});
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#FF6B6B', '#FFC0CB']}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>Match Maker</Text>
              <Text style={styles.subtitle}>Find your Business partners</Text>
            </View>
            <View style={[styles.form, { paddingBottom: Math.max(20, insets.bottom + 12) }]}>
          <Text style={styles.label}>Enter your email address</Text>
          <TextInput
            style={styles.input}
            placeholder="your.email@gmail.com"
            placeholderTextColor="rgba(0, 0, 0, 0.5)"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Your password (min 6 characters)"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(''); // Clear error when typing
              }}
              textContentType="password"
              autoComplete="password"
              selectionColor="#FF6B6B"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.toggleBtn}>
              <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          {!!error && <Text style={styles.error}>{error}</Text>}
                      <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          <TouchableOpacity
            style={styles.signupButton}
            onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupButtonText}>
              Don't have an account? Sign Up!
            </Text>
          </TouchableOpacity>
            </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  header: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    marginTop: 10,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 20,
    color: '#000000', // Ensure text is black and visible
    textAlignVertical: 'center',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 10,
  },
  toggleBtn: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  toggleText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
  },
  error: {
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import {launchImageLibrary} from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';


const SignupScreen = ({navigation}) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [gender, setGender] = useState('');
  const [image, setImage] = useState(null);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(''); // 'brand' | 'influencer'
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChoosePhoto = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message: 'This app needs access to your storage to select photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Storage permission denied');
        return;
      }
    }

    launchImageLibrary({mediaType: 'photo'}, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setImage({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          fileName: asset.fileName || asset.uri.split('/').pop() || 'profile.jpg'
        });
        console.log('Image selected:', asset);
      }
    });
  };

  const handleSignup = async () => {
    setError('');
    setIsLoading(true);
    
    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      setIsLoading(false);
      return;
    }
    
    // Phone number validation
    const trimmed = phone.replace(/\s+/g, '');
    if (!trimmed) {
      setError('Please enter your phone number');
      setIsLoading(false);
      return;
    }
    if (trimmed.length < 10) {
      setError('Phone number must be at least 10 digits');
      setIsLoading(false);
      return;
    }
    if (!trimmed.startsWith('+')) {
      setError('Phone number should start with + (e.g., +923018171782)');
      setIsLoading(false);
      return;
    }
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    
    if (!role) {
      setError('Please select your role (Brand or Influencer)');
      setIsLoading(false);
      return;
    }
    
    // Age validation
    if (!age || isNaN(age) || parseInt(age) < 18 || parseInt(age) > 100) {
      setError('Please enter a valid age (18-100 years)');
      setIsLoading(false);
      return;
    }
    
    // Location validation
    if (!location.trim()) {
      setError('Please enter your location');
      setIsLoading(false);
      return;
    }
    
    // Password validation
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }
    
    // Confirm password validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    

    
    try {
      const userData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        role: role,
        location: location.trim() || '',
        phoneNumber: trimmed,
        profilePicture: image ? image.uri : null
      };
      
      console.log('🚀 Registration data being sent:', userData);
      
      const result = await register(userData);
      
      if (result.success) {
        console.log('✅ Registration successful');
        navigation.reset({index: 0, routes: [{name: 'Login'}]});
      } else {
        console.error('❌ Registration failed:', result.message);
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('💥 Registration error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#FF6B6B', '#FFC0CB']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleChoosePhoto}>
              <View style={styles.avatarContainer}>
                {image ? (
                  <Image source={{uri: image.uri}} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>+</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.form}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setError(''); // Clear error when typing
              }}
              placeholder="+923018171782 (example)"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
            />
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError(''); // Clear error when typing
              }}
              placeholder="user@gmail.com (example)"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
              autoComplete="email"
            />
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError(''); // Clear error when typing
              }}
              placeholder="John Doe (example)"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              textContentType="name"
              autoComplete="name"
            />
            <Text style={styles.label}>You are</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                onPress={() => setRole('brand')}
                style={[styles.roleChip, role === 'brand' && styles.roleChipActive]}
              >
                <Text style={[styles.roleChipText, role === 'brand' && styles.roleChipTextActive]}>Brand</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRole('influencer')}
                style={[styles.roleChip, role === 'influencer' && styles.roleChipActive]}
              >
                <Text style={[styles.roleChipText, role === 'influencer' && styles.roleChipTextActive]}>Influencer</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={(text) => {
                setAge(text);
                setError(''); // Clear error when typing
              }}
              placeholder="25 (example)"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              keyboardType="numeric"
              textContentType="none"
              maxLength={3}
            />
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError(''); // Clear error when typing
                }}
                placeholder="at least 6 characters"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                secureTextEntry={!showPass}
                textContentType="password"
                autoComplete="password"
                selectionColor="#FF6B6B"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.toggleBtn}>
                <Text style={styles.toggleText}>{showPass ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setError(''); // Clear error when typing
                }}
                placeholder="confirm your password"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                secureTextEntry={!showConfirm}
                textContentType="password"
                autoComplete="password"
                selectionColor="#FF6B6B"
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.toggleBtn}>
                <Text style={styles.toggleText}>{showConfirm ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                setError(''); // Clear error when typing
              }}
              placeholder="Karachi, Pakistan (example)"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              textContentType="location"
            />
            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={styles.input}
              value={gender}
              onChangeText={(text) => {
                setGender(text);
                setError(''); // Clear error when typing
              }}
              placeholder="Male, Female, Other (example)"
              placeholderTextColor="rgba(255, 255, 255, 0.7)"
              textContentType="none"
            />
            {!!error && <Text style={styles.error}>{error}</Text>}
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>{isLoading ? 'Creating Account...' : 'Sign Up'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollView: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 1,
  },
  backButtonText: {
    color: 'white',
    fontSize: 30,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 40,
    color: 'white',
  },
  form: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 20,
  },
  label: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0,
  },
  toggleBtn: {
    marginLeft: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 10,
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
    marginTop: 20,
  },
  buttonText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  error: {
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 15,
    textAlign: 'center',
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  roleChip: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  roleChipActive: {
    backgroundColor: '#FFD6E2',
    borderColor: '#FF6B6B',
  },
  roleChipText: {
    color: '#333',
    fontSize: 16,
  },
  roleChipTextActive: {
    color: '#8A4A5C',
    fontWeight: '600',
  },
});

export default SignupScreen;

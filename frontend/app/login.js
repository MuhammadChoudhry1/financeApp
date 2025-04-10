import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'financeapp', 
    useProxy: false, 
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '221679920089-2ed69qm42skt4ghg18vvhphdj4hs29fm.apps.googleusercontent.com', 
    webClientId: '221679920089-ri13km3m7v39moqcnld7dg2grveiac1n.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    prompt: 'select_account',
    redirectUri: redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      fetchGoogleProfile(authentication.accessToken);
    }
  }, [response]);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Validation Error', 'Please enter both email and password.');
        return;
      }

      const response = await axios.post('http://192.168.1.214:5000/api/v1.0/login', null, {
        auth: {
          username: email,
          password: password,
        },
      });

      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        router.push('/homepage');
      } else {
        Alert.alert('Login Failed', response.data.error || 'Invalid login credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', error?.response?.data?.error || 'Could not connect to the server.');
    }
  };

  const fetchGoogleProfile = async (token) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = await res.json();
      console.log('Google Profile:', profile);

      const backendRes = await axios.post('http://192.168.1.214:5000/api/v1.0/google-login', {
        email: profile.email,
        name: profile.name,
      });

      if (backendRes.data.token) {
        await AsyncStorage.setItem('token', backendRes.data.token);
        router.push('/homepage');
      } else {
        Alert.alert('Login Failed', backendRes.data.error || 'Something went wrong.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to login with Google');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#6A5ACD', '#836FFF', '#48D1CC']} style={styles.background}>
        <View style={styles.overlay}>
          <Image source={require('../assets/images/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Login</Text>

          <TextInput
            style={styles.input}
            placeholder="Email or Username"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#DB4437' }]}
            onPress={async () => {
              if (response?.authentication?.accessToken) {
                await AuthSession.revokeAsync(
                  {
                    token: response.authentication.accessToken,
                  },
                  {
                    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
                  }
                );
              }
              promptAsync({ useProxy: false, prompt: 'select_account' });
            }}
            disabled={!request}
          >
            <Text style={styles.buttonText}>Login with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/forgot-password')}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Platform.OS === 'android' ? '#000' : 'transparent',
  },
  background: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#483D8B',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    color: '#836FFF',
    textAlign: 'center',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});

export default Login;

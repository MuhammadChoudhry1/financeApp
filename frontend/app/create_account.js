import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import InputField from './components/Common/InputField';
import PrimaryButton from './components/Common/PrimaryButton';
import AppLogo from './components/Common/AppLogo';

const { width, height } = Dimensions.get('window');

const CreateAccount = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleCreateAccount = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/api/v1.0/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ name, email, username, password }).toString(),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Account created successfully');
        navigation.navigate('homepage');
      } else {
        Alert.alert('Error', data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#6A5ACD', '#836FFF', '#48D1CC']} style={styles.background}>
        <View style={styles.overlay}>
          <AppLogo size={100} />
          <Text style={styles.title}>Create Account</Text>
          <InputField placeholder="Name" value={name} onChangeText={setName} />
          <InputField placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <InputField placeholder="Username" value={username} onChangeText={setUsername} />
          <InputField placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <InputField placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          <PrimaryButton title="Create Account" onPress={handleCreateAccount} />
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
});

export default CreateAccount;

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView } from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import CustomTextInput from './components/Common/CustomTextInput';
import PrimaryButton from './components/Common/PrimaryButton';

const ResetPassword = () => {
  const route = useRoute(); 
  const navigation = useNavigation(); 
  const token = route?.params?.token || route?.params?.queryParams?.token;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Invalid or missing token.');
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.214:5000/api/v1.0/reset-password', {
        token,
        password,
      });

      if (response.data.message) {
        Alert.alert('Success', 'Your password has been updated. Please log in.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Error', response.data.error || 'Something went wrong.');
      }
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.error || 'Could not connect to the server.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <CustomTextInput
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <CustomTextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <PrimaryButton title="Reset Password" onPress={handleResetPassword} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
});

export default ResetPassword;

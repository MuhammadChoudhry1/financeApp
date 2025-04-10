import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';

const ResetPassword = () => {
    const route = useRoute(); 
    const navigation = useNavigation(); 

    const token = route?.params?.token || route?.params?.queryParams?.token;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleResetPassword = async () => {
        try {
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

            const response = await axios.post('http://192.168.1.214:5000/api/v1.0/reset-password', {
                token,
                password,
            });

            if (response.data.message) {
                Alert.alert('Success', 'Your password has been updated. Please log in with your new password.', [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Login'), 
                    },
                ]);
            } else {
                Alert.alert('Error', response.data.error || 'Something went wrong.');
            }
        } catch (error) {
            console.error('Reset Password error:', error);
            Alert.alert('Error', error?.response?.data?.error || 'Could not connect to the server.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>
            <TextInput
                style={styles.input}
                placeholder="New Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 16 },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
    input: {
        height: 50, borderColor: 'gray', borderWidth: 1, marginBottom: 12,
        paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'white'
    },
    button: {
        backgroundColor: '#483D8B', paddingVertical: 15, paddingHorizontal: 20,
        borderRadius: 8, marginVertical: 10, alignItems: 'center'
    },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default ResetPassword;

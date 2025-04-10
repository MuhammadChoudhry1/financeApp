import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const navigation = useNavigation();

    const handleForgotPassword = async () => {
        try {
            if (!email) {
                Alert.alert('Validation Error', 'Please enter your email.');
                return;
            }

            const response = await axios.post('http://192.168.1.214:5000/api/v1.0/forgot-password', { email });

            if (response.data.message) {
                Alert.alert('Success', response.data.message);

                if (response.data.token) {
                    navigation.navigate('ResetPassword', { token: response.data.token });
                }
            } else {
                Alert.alert('Error', response.data.error || 'Something went wrong.');
            }
        } catch (error) {
            console.error('Forgot Password error:', error);
            Alert.alert('Error', error?.response?.data?.error || 'Could not connect to the server.');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Forgot Password</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
                <Text style={styles.buttonText}>Send Reset Link</Text>
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

export default ForgotPassword;

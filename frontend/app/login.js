import React, { useState } from 'react';
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
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

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
                console.log('Login successful! Token:', response.data.token);

                // ✅ Store token securely in AsyncStorage
                await AsyncStorage.setItem('token', response.data.token);

                // ✅ Navigate to homepage
                router.push('/homepage');
            } else {
                console.error('Login failed:', response.data.error);
                Alert.alert('Login Failed', response.data.error || 'Invalid login credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', error?.response?.data?.error || 'Could not connect to the server.');
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
});

export default Login;

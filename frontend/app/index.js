import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, Platform, SafeAreaView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const Home = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={['#6A5ACD', '#836FFF', '#48D1CC']} style={styles.background}>
                <View style={styles.overlay}>
                    <Image source={require('../assets/images/logo.png')} style={styles.logo} />
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('login')}>
                        <Text style={styles.buttonText}>Log In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('create_account')}>
                        <Text style={styles.buttonText}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

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
        alignItems: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 30,
        borderRadius: 60,
    },
    button: {
        backgroundColor: '#483D8B', 
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginVertical: 10,
        width: '80%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Home;

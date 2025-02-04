import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, SafeAreaView, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Home = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={['#6A5ACD', '#836FFF', '#48D1CC']} style={styles.background}>
                <View style={styles.overlay}>
                    {/* Design elements without links, images, or functions */}
                    <Text style={styles.placeholderText}>Placeholder Text</Text>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Log In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
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
    placeholderText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#483D8B', // Darker shade of purple
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
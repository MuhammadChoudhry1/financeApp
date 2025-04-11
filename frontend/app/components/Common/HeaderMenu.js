import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HeaderMenu = () => {
    const [menuVisible, setMenuVisible] = useState(false);
    const navigation = useNavigation();

    const toggleMenu = () => setMenuVisible(!menuVisible);
    const closeMenu = () => setMenuVisible(false);

    const handleLogout = async () => {
        closeMenu();
        navigation.replace('index');

        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                await axios.post(
                    'http://192.168.1.214:5000/api/v1.0/logout',
                    {},
                    { headers: { 'x-access-token': token } }
                );
            }
            await AsyncStorage.removeItem('token');
        } catch (error) {
            console.error('Error during logout:', error.response?.data || error.message);
        }
    };

    return (
        <View style={styles.menuContainer}>
            <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
                <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>

            {menuVisible && (
                <View style={styles.menu}>
                    <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
                        <Text style={styles.menuItemText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    menuContainer: {
        backgroundColor: '#fff',
        height: 50,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        zIndex: 10,
    },
    menuButton: {
        padding: 10,
    },
    menuIcon: {
        fontSize: 28,
        color: 'black',
    },
    menu: {
        position: 'absolute',
        top: 50,
        left: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        zIndex: 999,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    menuItem: {
        paddingVertical: 10,
    },
    menuItemText: {
        fontSize: 16,
        color: '#333',
    },
});

export default HeaderMenu;

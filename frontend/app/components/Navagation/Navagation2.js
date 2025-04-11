import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NavigationBar = () => {
    const navigation = useNavigation();

    const navItems = [
        { label: 'Home', screen: 'homepage' },
        { label: 'Expense Tracking', screen: 'expensetracking' },
        { label: 'Income Documentation', screen: 'incomeDocumentation' },
        { label: 'Saving Goals', screen: 'saving_goals' },
        { label: 'Budgeting', screen: 'budget' },
       
        { label: 'Reporting Analytics', screen: 'graphs' },
     
    ];

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.navBarContainer}
            contentContainerStyle={styles.navBarContent}
        >
            {navItems.map((item, index) => (
                <TouchableOpacity
                    key={index}
                    style={[styles.navBarItem, styles.navBarItemShadow]}
                    onPress={() => navigation.navigate(item.screen)}
                >
                    <Text style={styles.navBarText}>{item.label}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    navBarContainer: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingBottom: 0,
        marginBottom: 0,
        paddingTop: 10,
    },
    navBarContent: {
        flexDirection: 'row',
        paddingHorizontal: 10,
    },
    navBarItem: {
        backgroundColor: '#fff',
        height: 55,
        paddingHorizontal: 25,
        borderRadius: 15,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    navBarItemShadow: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    navBarText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default NavigationBar;

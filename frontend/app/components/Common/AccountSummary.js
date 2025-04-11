import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const AccountSummary = ({ accountBalance, totalIncome, totalExpenses }) => {
    return (
        <View style={styles.topBackground}>
            <View style={styles.headerContainer}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/logo.png')}
                        style={styles.logo}
                    />
                </View>

                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceText}>Account Balance</Text>
                    <Text style={styles.balanceAmount}>{`$${accountBalance}`}</Text>

                    <View style={styles.breakdownContainer}>
                        <View style={styles.breakdownItem}>
                            <FontAwesome5
                                name="arrow-up"
                                size={16}
                                color="green"
                                style={styles.breakdownIcon}
                            />
                            <Text style={styles.breakdownText}>Income: ${totalIncome}</Text>
                        </View>
                        <View style={styles.breakdownItem}>
                            <FontAwesome5
                                name="arrow-down"
                                size={16}
                                color="red"
                                style={styles.breakdownIcon}
                            />
                            <Text style={styles.breakdownText}>Expenses: ${totalExpenses}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    topBackground: {
        width: '100%',
        height: '30%',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#6A5ACD',
        elevation: 5,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#f0f0f0',
        elevation: 3,
    },
    balanceContainer: {
        flex: 1,
        marginLeft: 10,
    },
    balanceText: {
        fontSize: 22,
        color: '#fff',
        fontWeight: 'bold',
    },
    balanceAmount: {
        fontSize: 38,
        fontWeight: 'bold',
        color: '#fff',
    },
    breakdownContainer: {
        marginTop: 8,
    },
    breakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    breakdownIcon: {
        marginRight: 8,
    },
    breakdownText: {
        fontSize: 14,
        color: '#fff',
    },
});

export default AccountSummary;

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ScrollView,
    Platform,
    SafeAreaView,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ Import AsyncStorage

const { width, height } = Dimensions.get('window');

const HomePage = () => {
    const navigation = useNavigation();
    const [expenses, setExpenses] = useState([]);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // ✅ Fetch expenses from the backend with token
    const fetchExpenses = async () => {
        try {
            const token = await AsyncStorage.getItem('token'); // ✅ Get token
            const response = await axios.get('http://192.168.1.214:5000/api/v1.0/expenses', {
                headers: {
                    'x-access-token': token, // ✅ Secure header
                },
                params: {
                    pn: pageNum,
                    ps: pageSize,
                },
            });
            setExpenses(response.data);
        } catch (error) {
            console.error('Error fetching expenses:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [pageNum, pageSize]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Top Section with Logo and Balance */}
                <View style={styles.topBackground}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.logoContainer}>
                            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
                        </TouchableOpacity>
                        <View style={styles.balanceContainer}>
                            <Text style={styles.balanceText}>Account Balance</Text>
                            <Text style={styles.balanceAmount}>$1234.56</Text>
                        </View>
                    </View>
                </View>

                {/* Navigation Buttons */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.navBarContainer}
                    contentContainerStyle={styles.navBarContent}
                >
                    <TouchableOpacity
                        style={[styles.navBarItem, styles.navBarItemShadow]}
                        onPress={() => navigation.navigate('expensetracking')}
                    >
                        <Text style={styles.navBarText}>Expense Tracking</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.navBarItem, styles.navBarItemShadow]}
                        onPress={() => navigation.navigate('incomeDocumentation')}
                    >
                        <Text style={styles.navBarText}>Income Documentation</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.navBarItem, styles.navBarItemShadow]}
                        onPress={() => navigation.navigate('saving_goals')}
                    >
                        <Text style={styles.navBarText}>Saving Goals</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.navBarItem, styles.navBarItemShadow]}
                        onPress={() => navigation.navigate('graphs')}
                    >
                        <Text style={styles.navBarText}>Reporting Analytics</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Expenses List */}
                <View style={styles.expenseListContainer}>
                    <ScrollView contentContainerStyle={styles.expenseListContent}>
                        {expenses.map((expense) => (
                            <View key={expense.id || expense._id} style={styles.expenseItem}>
                                <View>
                                    <Text style={styles.expenseDescription}>{expense.description}</Text>
                                    <Text style={styles.expenseCategory}>{expense.category}</Text>
                                </View>
                                <Text style={styles.expenseAmount}>${Number(expense.amount).toFixed(2)}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Platform.OS === 'android' ? '#fff' : '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
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
    expenseListContainer: {
        flex: 15,
        padding: 10,
    },
    expenseListContent: {
        flexGrow: 1,
    },
    expenseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginVertical: 8,
        width: '100%',
    },
    expenseDescription: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    expenseAmount: {
        fontSize: 16,
        color: '#6A5ACD',
        fontWeight: 'bold',
    },
    expenseCategory: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
    },
});

export default HomePage;

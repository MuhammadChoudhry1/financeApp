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
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons'; 

const { width, height } = Dimensions.get('window');

const HomePage = () => {
    const navigation = useNavigation();
    const [expenses, setExpenses] = useState([]);
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [accountBalance, setAccountBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalSavings, setTotalSavings] = useState(0);
    const [menuVisible, setMenuVisible] = useState(false);

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    const closeMenu = () => {
        setMenuVisible(false);
    };

    const handleLogout = async () => {
        console.log('Logout initiated'); 
        closeMenu();

        navigation.replace('index');
        console.log('Navigated to Login'); 

        try {
            const token = await AsyncStorage.getItem('token');
            console.log('Token before removal:', token); 

            if (token) {
                await axios.post(
                    'http://192.168.1.214:5000/api/v1.0/logout',
                    {},
                    {
                        headers: {
                            'x-access-token': token,
                        },
                    }
                );
                console.log('Logout API called successfully'); 
            }

            await AsyncStorage.removeItem('token'); 
            console.log('Token removed'); 
        } catch (error) {
            console.error('Error during logout:', error.response?.data || error.message); 
        }
    };

    const fetchExpenses = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('http://192.168.1.214:5000/api/v1.0/expenses', {
                headers: {
                    'x-access-token': token,
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

    const fetchAccountBalance = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('http://192.168.1.214:5000/api/v1.0/account_balance', {
                headers: {
                    'x-access-token': token,
                },
            });

            setAccountBalance(response.data.account_balance);
            setTotalIncome(response.data.total_income);
            setTotalExpenses(response.data.total_expenses);
            setTotalSavings(response.data.total_savings);
        } catch (error) {
            console.error('Error fetching account balance:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchExpenses();
            await fetchAccountBalance();
            setLoading(false);
        };
        fetchData();
    }, [pageNum, pageSize]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.menuContainer}>
                    <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
                        <Text style={{ fontSize: 28, color: 'black' }}>☰</Text>
                    </TouchableOpacity>
                </View>

                {menuVisible && (
                    <View style={styles.menu}>
                        <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
                            <Text style={styles.menuItemText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.topBackground}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.logoContainer}>
                            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
                        </TouchableOpacity>

                        <View style={styles.balanceContainer}>
                            <Text style={styles.balanceText}>Account Balance</Text>
                            <Text style={styles.balanceAmount}>{`$${accountBalance}`}</Text>
                            <View style={styles.breakdownContainer}>
                                <View style={styles.breakdownItem}>
                                    <FontAwesome5 name="arrow-up" size={16} color="green" style={styles.breakdownIcon} />
                                    <Text style={styles.breakdownText}>Income: ${totalIncome}</Text>
                                </View>
                                <View style={styles.breakdownItem}>
                                    <FontAwesome5 name="arrow-down" size={16} color="red" style={styles.breakdownIcon} />
                                    <Text style={styles.breakdownText}>Expenses: ${totalExpenses}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

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
                    <TouchableOpacity
                        style={[styles.navBarItem, styles.navBarItemShadow]}
                        onPress={() => navigation.navigate('budget')}
                    >
                        <Text style={styles.navBarText}>Budgeting</Text> 
                    </TouchableOpacity>
                </ScrollView>

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
    menuContainer: {
        backgroundColor: '#fff', 
        height: 50, 
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'flex-start', 
        alignItems: 'center',
    },
    menuButton: {
        padding: 10,
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

export default HomePage;

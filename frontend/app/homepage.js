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
import NavigationBar from './components/Navagation/Navagation'; // Import NavigationBar
import HeaderMenu from './components/Common/HeaderMenu'; // Import HeaderMenu
import AccountSummary from './components/Common/AccountSummary'; // Import AccountSummary

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
            <HeaderMenu /> {/* Add HeaderMenu component */}
            <View style={styles.container}>
                <AccountSummary
                    accountBalance={accountBalance}
                    totalIncome={totalIncome}
                    totalExpenses={totalExpenses}
                /> {/* Call AccountSummary component */}
                <NavigationBar /> {/* Add NavigationBar component */}
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
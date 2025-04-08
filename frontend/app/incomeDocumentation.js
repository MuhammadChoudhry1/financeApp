import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, Alert, StyleSheet, TouchableOpacity, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const IncomeDocumentation = () => {
  const router = useRouter();
  const [incomeList, setIncomeList] = useState([]);
  const [newIncome, setNewIncome] = useState({ name: '', amount: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [currentEdit, setCurrentEdit] = useState({ name: '', amount: '' });
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);


    useEffect(() => {
        fetchIncomeData();
    }, []);

    const fetchIncomeData = async () => {
        try {
            const token = await AsyncStorage.getItem('token'); // ✅ Get token from AsyncStorage
            const response = await fetch('http://localhost:5000/api/v1.0/salaries', {
                headers: { 'x-access-token': token }, // ✅ Add token to headers
            });
            const data = await response.json();
            const formattedData = data.map(income => ({
                ...income,
                amount: parseFloat(income.amount),
            }));
            setIncomeList(formattedData.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch income data.');
        }
    };

    const deleteIncome = async (id) => {
        try {
            const token = await AsyncStorage.getItem('token'); // ✅ Get token from AsyncStorage
            const response = await fetch(`http://localhost:5000/api/v1.0/salaries/${id}`, {
                method: 'DELETE',
                headers: { 'x-access-token': token }, // ✅ Add token to headers
            });
            if (response.ok) {
                setIncomeList(incomeList.filter(income => income.id !== id));
            } else {
                Alert.alert('Error', 'Failed to delete income.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while deleting the income.');
        }
    };

    const toggleEditModal = (index) => {
        if (editIndex === index) {
            setEditIndex(null);
            setEditModalVisible(false);
            return;
        }
        setEditIndex(index);
        setCurrentEdit(incomeList[index]);
        setEditModalVisible(true);
    };

    const saveIncomeEdit = async (id) => {
        if (!currentEdit.name || !currentEdit.amount) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token'); // ✅ Get token from AsyncStorage
            const formData = new URLSearchParams();
            formData.append('name', currentEdit.name);
            formData.append('amount', parseFloat(currentEdit.amount));

            const response = await fetch(`http://localhost:5000/api/v1.0/salaries/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-access-token': token, // ✅ Add token to headers
                },
                body: formData.toString(),
            });

            if (response.ok) {
                setIncomeList(incomeList.map(income => income.id === id ? { ...income, ...currentEdit } : income));
                setEditIndex(null);
                setEditModalVisible(false);
            } else {
                Alert.alert('Error', 'Failed to update income.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while updating the income.');
        }
    };

    const addIncome = async () => {
        if (!newIncome.name || !newIncome.amount) {
            Alert.alert('Error', 'Name and amount are required.');
            return;
        }

        try {
            const token = await AsyncStorage.getItem('token'); // ✅ Get token from AsyncStorage
            const formData = new URLSearchParams();
            formData.append('name', newIncome.name);
            formData.append('amount', parseFloat(newIncome.amount));
            formData.append('date', new Date().toISOString());

            const response = await fetch('http://localhost:5000/api/v1.0/salaries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'x-access-token': token, // ✅ Add token to headers
                },
                body: formData.toString(),
            });

            if (response.ok) {
                const result = await response.json();
                const newIncomeEntry = {
                    ...newIncome,
                    amount: parseFloat(newIncome.amount),
                    id: result.id,
                    date: result.date,
                };
                setIncomeList([newIncomeEntry, ...incomeList]);
                setNewIncome({ name: '', amount: '' });
                setAddModalVisible(false);
            } else {
                Alert.alert('Error', 'Failed to add income.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while adding the income.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Income Documentation</Text>
                  {/* Navigation Bar at the Top */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.navBarContainer}
        contentContainerStyle={styles.navBarContent}
      >
        <TouchableOpacity style={styles.navBarItem} onPress={() => navigation.navigate('expensetracking')}>
          <Text style={styles.navBarText}>Expense Tracking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBarItem} onPress={() => navigation.navigate('incomeDocumentation')}>
          <Text style={styles.navBarText}>Income Documentation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBarItem} onPress={() => navigation.navigate('saving_goals')}>
          <Text style={styles.navBarText}>Saving Goals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBarItem} onPress={() => navigation.navigate('graphs')}>
          <Text style={styles.navBarText}>Reporting Analytics</Text>
        </TouchableOpacity>
      </ScrollView>

<View style={{flex:45}}>
            <FlatList
                data={incomeList}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <View style={styles.incomeItem}>
                        <View>
                            <Text>{item.name}</Text>
                            <Text>Amount: ${item.amount.toFixed(2)}</Text>
                            <Text>Date: {item.date}</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.roundButton} onPress={() => deleteIncome(item.id)}>
                                <Text style={styles.buttonText}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.roundButton} onPress={() => toggleEditModal(index)}>
                                <Text style={styles.buttonText}>Edit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            </View>
            <View style={styles.addButtonContainer}>
                <TouchableOpacity style={styles.roundButton} onPress={() => setAddModalVisible(true)}>
                    <Text style={styles.buttonText}>Add Income</Text>
                </TouchableOpacity>
            </View>
            {isAddModalVisible && (
                <View style={styles.modalContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        value={newIncome.name}
                        onChangeText={(text) => setNewIncome({ ...newIncome, name: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Amount"
                        value={newIncome.amount}
                        onChangeText={(text) => setNewIncome({ ...newIncome, amount: text })}
                        keyboardType="numeric"
                    />
                    <View style={styles.buttonSpacing}> {/* Add a container for spacing */}
                        <TouchableOpacity style={styles.roundButton} onPress={addIncome}>
                            <Text style={styles.buttonText}>Add Income</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.roundButton} onPress={() => setAddModalVisible(false)}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {isEditModalVisible && (
                <View style={styles.modalContainer}>
                    <TextInput
                        style={styles.input}
                        value={currentEdit.name}
                        onChangeText={(text) => setCurrentEdit({ ...currentEdit, name: text })}
                        placeholder="Name"
                    />
                    <TextInput
                        style={styles.input}
                        value={currentEdit.amount.toString()}
                        onChangeText={(text) => {
                            const amount = parseFloat(text);
                            setCurrentEdit({ ...currentEdit, amount: isNaN(amount) ? '' : amount });
                        }}
                        placeholder="Amount"
                        keyboardType="numeric"
                    />
                    <View style={styles.buttonSpacing}> {/* Add a container for spacing */}
                        <TouchableOpacity style={styles.roundButton} onPress={() => saveIncomeEdit(currentEdit.id)}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.roundButton} onPress={() => setEditModalVisible(false)}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#6A5ACD',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    incomeItem: {
        padding: 15,
        backgroundColor: '#fff',
        marginBottom: 10,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'column',
        gap: 10,
    },
    roundButton: {
        backgroundColor: '#6A5ACD',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
    },
    addButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
    },
    modalContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -150 }, { translateY: -150 }],
        width: 300,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    buttonSpacing: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10, // Add margin between buttons
    },
    navBarContainer: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingTop: 10,
      },
      navBarContent: {
        flexDirection: 'row',
        paddingHorizontal: 10,
      },
      navBarItem: {
        backgroundColor: '#6A5ACD',
        height: 50,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
      },
      navBarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
      },
});

export default IncomeDocumentation;

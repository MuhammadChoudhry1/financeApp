import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const saving_goals = () => {
    const router = useRouter();
    const [incomes, setIncomes] = useState([]);
    const [newIncome, setNewIncome] = useState({ name: '', amount: '' });
    const [editMode, setEditMode] = useState(null);
    const [editedIncome, setEditedIncome] = useState({ name: '', amount: '' });
    const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchIncomes();
    }, []);

    const fetchIncomes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/v1.0/salaries');
            const data = await response.json();
            const parsedData = data.map(income => ({
                ...income,
                amount: parseFloat(income.amount) // Ensure amount is a number
            }));
            setIncomes(parsedData.sort((a, b) => new Date(b.date) - new Date(a.date))); // Sort by date to keep the latest at the top
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch incomes.');
        }
    };

    const handleDeleteIncome = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/v1.0/salaries/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setIncomes(incomes.filter(income => income.id !== id));
            } else {
                Alert.alert('Error', 'Failed to delete income.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while deleting the income.');
        }
    };

    const toggleEditMode = (index) => {
        if (editMode === index) {
            setEditMode(null);
            setShowEditModal(false);
            return;
        }
        setEditMode(index);
        setEditedIncome(incomes[index]);
        setShowEditModal(true); // Show the edit modal
    };

    const handleSaveEdit = async (id) => {
        if (!editedIncome.name || !editedIncome.amount) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('name', editedIncome.name);
            formData.append('amount', parseFloat(editedIncome.amount)); // Ensure amount is a number

            const response = await fetch(`http://localhost:5000/api/v1.0/salaries/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            if (response.ok) {
                setIncomes(incomes.map(income => income.id === id ? { ...income, ...editedIncome } : income));
                setEditMode(null);
            } else {
                Alert.alert('Error', 'Failed to edit income.');
            }

        } catch (error) {
            Alert.alert('Error', 'An error occurred while editing the income.');
        }
    };

    const handleAddIncome = async () => {
        if (!newIncome.name || !newIncome.amount) {
            Alert.alert('Error', 'Name and amount are required.');
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('name', newIncome.name);
            formData.append('amount', parseFloat(newIncome.amount)); // Ensure amount is a number
            formData.append('date', new Date().toISOString()); // Set the current date

            const response = await fetch('http://localhost:5000/api/v1.0/salaries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            if (response.ok) {
                const result = await response.json();
                const newIncomeWithId = { 
                    ...newIncome, 
                    amount: parseFloat(newIncome.amount), // Ensure amount is a number
                    id: result.id, // Use the returned ID
                    date: result.date // Use the returned date
                };
                setIncomes([newIncomeWithId, ...incomes]); // Add new income at the top
                setNewIncome({ name: '', amount: '' });
                setShowAddIncomeModal(false);
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
          
              <FlatList
                data={incomes}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <View style={styles.incomeItem}>
                    <View>
                      <Text>{item.name}</Text>
                      <Text>Amount: ${item.amount.toFixed(2)}</Text>
                      <Text>Date: {item.date}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity style={styles.roundButton} onPress={() => handleDeleteIncome(item.id)}>
                        <Text style={styles.buttonText}>Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.roundButton} onPress={() => toggleEditMode(index)}>
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
          
              <View style={styles.addButtonContainer}>
                <TouchableOpacity style={styles.roundButton} onPress={() => setShowAddIncomeModal(true)}>
                  <Text style={styles.buttonText}>Add Income</Text>
                </TouchableOpacity>
              </View>
          
              {showAddIncomeModal && (
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
                  <TouchableOpacity style={styles.roundButton} onPress={handleAddIncome}>
                    <Text style={styles.buttonText}>Add Income</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.roundButton} onPress={() => setShowAddIncomeModal(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
          
              {showEditModal && (
                <View style={styles.modalContainer}>
                  <TextInput
                    style={styles.input}
                    value={editedIncome.name}
                    onChangeText={(text) => setEditedIncome({ ...editedIncome, name: text })}
                    placeholder="Name"
                  />
                  <TextInput
                    style={styles.input}
                    value={editedIncome.amount.toString()}
                    onChangeText={(text) => {
                      const amount = parseFloat(text);
                      setEditedIncome({ ...editedIncome, amount: isNaN(amount) ? '' : amount });
                    }}
                    placeholder="Amount"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.roundButton} onPress={() => handleSaveEdit(editedIncome.id)}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.roundButton} onPress={() => setShowEditModal(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
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
      flexDirection: 'column', // Arrange buttons vertically
      gap: 10, // Adds space between buttons
    },
    roundButton: {
      backgroundColor: '#6A5ACD',
      borderRadius: 20, // Makes the button round
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
  });

export default saving_goals;
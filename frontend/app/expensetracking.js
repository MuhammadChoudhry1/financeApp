import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

const ExpenseTracking = () => {
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: '' });
    const [editMode, setEditMode] = useState(null);
    const [editedExpense, setEditedExpense] = useState({ description: '', amount: '', category: '' });
    const [categories] = useState(['Food', 'Transport', 'Entertainment', 'Utilities', 'Investments']);
    const [deleteMode, setDeleteMode] = useState(null);
    const [showInputExpense, setShowInputExpense] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/v1.0/expenses');
            const data = await response.json();
            const parsedData = data.map(expense => ({
                ...expense,
                amount: parseFloat(expense.amount)
            }));
            setExpenses(parsedData);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch expenses.');
        }
    };

    const handleDeleteExpense = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/v1.0/expenses/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setExpenses(expenses.filter(expense => expense.id !== id));  // Use "id" instead of "_id"
            } else {
                Alert.alert('Error', 'Failed to delete expense.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while deleting the expense.');
        }
    };

    const toggleDeleteMode = (id) => {
        setDeleteMode((prev) => (prev === id ? null : id));
        setEditMode(null);
    };

    const toggleEditMode = (index) => {
        if (editMode === index) {
            setEditMode(null);
            setShowEditModal(false);
            return;
        }
        setEditMode(index);
        setEditedExpense(expenses[index]);
        setShowEditModal(true); // Show the edit modal
    };

    const handleSaveEdit = async (id) => {
        if (!editedExpense.description || !editedExpense.amount || !editedExpense.category) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }
    
        try {
            const formData = new URLSearchParams();
            formData.append('description', editedExpense.description);  // changed from 'name' to 'description'
            formData.append('amount', editedExpense.amount.toString());  // Ensure amount is a string
            formData.append('category', editedExpense.category);
    
            const response = await fetch(`http://localhost:5000/api/v1.0/expenses/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });
    
            if (response.ok) {
                const updatedExpenses = expenses.map(expense =>
                    expense.id === id ? { ...editedExpense, id, amount: parseFloat(editedExpense.amount) } : expense
                );
                setExpenses(updatedExpenses);
                setEditMode(null);
                setEditedExpense({ description: '', amount: '', category: '' });
                setShowEditModal(false);
            } else {
                Alert.alert('Error', 'Failed to edit expense.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while editing the expense.');
        }
    };
    

    const handleAddExpense = async () => {
        if (!newExpense.description || !newExpense.amount || !newExpense.category) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }
    
        try {
            const formData = new URLSearchParams();
            formData.append('description', newExpense.description);
            formData.append('amount', newExpense.amount);
            formData.append('category', newExpense.category);
    
            const response = await fetch('http://localhost:5000/api/v1.0/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });
    
            if (response.ok) {
                const result = await response.json();
                // Use the id returned from the backend
                const newExpenseWithId = { 
                    ...newExpense, 
                    amount: parseFloat(newExpense.amount), 
                    id: result.id  // Use "id" instead of trying to extract from URL
                };
                setExpenses([...expenses, newExpenseWithId]);
                setNewExpense({ description: '', amount: '', category: '' });
                setShowInputExpense(false);
            } else {
                Alert.alert('Error', 'Failed to add expense.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while adding the expense.');
        }
    };
    

    const groupedExpenses = expenses.reduce((acc, expense) => {
        if (!acc[expense.category]) {
            acc[expense.category] = [];
        }
        acc[expense.category].push(expense);
        return acc;
    }, {});

    const categoryTotals = Object.keys(groupedExpenses).reduce((acc, category) => {
        const total = groupedExpenses[category].reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        acc[category] = total;
        return acc;
    }, {});

    return (
        <View style={styles.container}>
          <Text style={styles.title}>Expenses</Text>
      
          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={styles.expenseItem}>
                <View>
                  <Text>{item.description}</Text>
                  <Text>Amount: ${item.amount.toFixed(2)}</Text>
                  <Text>Category: {item.category}</Text>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.roundButton} onPress={() => handleDeleteExpense(item.id)}>
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
            <TouchableOpacity style={styles.roundButton} onPress={() => setShowInputExpense(true)}>
              <Text style={styles.buttonText}>Add Expense</Text>
            </TouchableOpacity>
          </View>
      
          {showInputExpense && (
            <View style={styles.modalContainer}>
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={newExpense.description}
                onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Amount"
                value={newExpense.amount}
                onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                keyboardType="numeric"
              />
              <Picker
                selectedValue={newExpense.category}
                style={styles.input}
                onValueChange={(itemValue) => setNewExpense({ ...newExpense, category: itemValue })}
              >
                <Picker.Item label="Select Category" value="" />
                {categories.map((cat, index) => (
                  <Picker.Item key={index} label={cat} value={cat} />
                ))}
              </Picker>
              <TouchableOpacity style={styles.roundButton} onPress={handleAddExpense}>
                <Text style={styles.buttonText}>Add Expense</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.roundButton} onPress={() => setShowInputExpense(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
      
          {showEditModal && (
            <View style={styles.modalContainer}>
              <TextInput
                style={styles.input}
                value={editedExpense.description}
                onChangeText={(text) => setEditedExpense({ ...editedExpense, description: text })}
                placeholder="Description"
              />
              <TextInput
                style={styles.input}
                value={editedExpense.amount.toString()}
                onChangeText={(text) => setEditedExpense({ ...editedExpense, amount: text })}
                placeholder="Amount"
                keyboardType="numeric"
              />
              <Picker
                selectedValue={editedExpense.category}
                style={styles.input}
                onValueChange={(itemValue) => setEditedExpense({ ...editedExpense, category: itemValue })}
              >
                <Picker.Item label="Select Category" value="" />
                {categories.map((cat, index) => (
                  <Picker.Item key={index} label={cat} value={cat} />
                ))}
              </Picker>
              <TouchableOpacity style={styles.roundButton} onPress={() => handleSaveEdit(editedExpense.id)}>
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
    expenseItem: {
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

export default ExpenseTracking;

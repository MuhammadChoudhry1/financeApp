import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

const ExpenseTracking = () => {
    const [expenses, setExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: '' });
    const [editMode, setEditMode] = useState(null);
    const [editedExpense, setEditedExpense] = useState({ description: '', amount: '', category: '' });
    const [categories] = useState(['Food', 'Transport', 'Entertainment', 'Utilities', 'Investments']);

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
                setExpenses(expenses.filter(expense => expense._id !== id));
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
            return;
        }
        setEditMode(index);
        setDeleteMode(null);
        setEditedExpense(expenses[index]);
    };

    const handleSaveEdit = async (id) => {
        if (!editedExpense.description || !editedExpense.amount || !editedExpense.category) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }
    
        try {
            const formData = new URLSearchParams();
            formData.append('description', editedExpense.description);  // changed from 'name' to 'description'
            formData.append('amount', editedExpense.amount);
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
                    expense.id === id ? { ...editedExpense, id } : expense
                );
                setExpenses(updatedExpenses);
                setEditMode(null);
                setEditedExpense({ description: '', amount: '', category: '' });
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
            <Button
                title="Add Expense"
                onPress={handleAddExpense}
            />
            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <View style={styles.expenseItem}>
                        {editMode === index ? (
                            <>
                                <TextInput
                                    style={styles.input}
                                    value={editedExpense.description}
                                    onChangeText={(text) => setEditedExpense({ ...editedExpense, description: text })}
                                    placeholder="Description"
                                />
                                <TextInput
                                    style={styles.input}
                                    value={editedExpense.amount.toString()}
                                    onChangeText={(text) => setEditedExpense({ ...editedExpense, amount: parseFloat(text) })}
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
                                <Button
                                    title="Save"
                                    onPress={() => handleSaveEdit(item.id)}
                                />
                            </>
                        ) : (
                            <>
                                <Text>{item.description}</Text>
                                <Text>Amount: ${item.amount.toFixed(2)}</Text>
                                <Text>Category: {item.category}</Text>
                                <Button title="Edit" onPress={() => toggleEditMode(index)} />
                                <Button title="Delete" onPress={() => handleDeleteExpense(item.id)} />
                            </>
                        )}
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
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
    },
});

export default ExpenseTracking;

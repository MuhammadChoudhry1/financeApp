import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router'; // Import useRouter

const ExpenseTracking = () => {
    const router = useRouter(); // Initialize router
    const [expenses, setExpenses] = useState([]);
    const [showInputExpense, setShowInputExpense] = useState(false);
    const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: '' });
    const [editMode, setEditMode] = useState(null); // To track the expense being edited
    const [deleteMode, setDeleteMode] = useState(null); // To track the expense in delete mode
    const [editedExpense, setEditedExpense] = useState({ description: '', amount: '', category: '' });
    const [categories] = useState(['Food', 'Transport', 'Entertainment', 'Utilities', 'Investments']);

    const handleDeleteExpense = (id) => {
        const expenseToDelete = expenses[id];
        setExpenses(expenses.filter((expense, index) => index !== id));
    };

    const toggleDeleteMode = (id) => {
        setDeleteMode((prev) => (prev === id ? null : id));
        setEditMode(null); // Exit edit mode when toggling delete mode
    };

    const toggleEditMode = (index) => {
        if (editMode === index) {
            setEditMode(null);
            return;
        }
        setEditMode(index);
        setDeleteMode(null); // Exit delete mode when toggling edit mode
        setEditedExpense(expenses[index]);
    };

    const handleSaveEdit = async (idd) => {
        if (!editedExpense.description || !editedExpense.amount || !editedExpense.category) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:5000/api/v1.0/expenses/${idd}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editedExpense.description,
                    amount: editedExpense.amount,
                    category: editedExpense.category,
                }),
            });
    
            if (response.ok) {
                const updatedExpenses = expenses.map(expense => 
                    expense._id === idd ? { ...editedExpense, _id: idd } : expense
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
            const response = await fetch('http://localhost:5000/api/v1.0/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newExpense.description,
                    amount: newExpense.amount,
                    category: newExpense.category,
                }),
            });

            if (response.ok) {
                const result = await response.json();
                setExpenses([...expenses, { ...newExpense, amount: parseFloat(newExpense.amount) }]);
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
        const total = groupedExpenses[category].reduce((sum, expense) => sum + expense.amount, 0);
        acc[category] = total;
        return acc;
    }, {});

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.expenseListContent}>
                <View style={styles.categoryTotalsContainer}>
                    {Object.keys(categoryTotals).map((category, index) => (
                        <View key={index} style={styles.categoryTotal}>
                            <Text style={styles.categoryTotalText}>{category}: ${categoryTotals[category].toFixed(2)}</Text>
                        </View>
                    ))}
                </View>
                {Object.keys(groupedExpenses).map((category, index) => (
                    <View key={index} style={styles.categoryContainer}>
                        <Text style={styles.categoryTitle}>{category}</Text>
                        {groupedExpenses[category].map((expense, expenseIndex) => (
                            <View key={expense._id} style={styles.expenseItem}>
                                {editMode === expenseIndex ? (
                                    <>
                                        <TextInput
                                            style={styles.editInput}
                                            value={editedExpense.description}
                                            onChangeText={(text) => setEditedExpense({ ...editedExpense, description: text })}
                                            placeholder="Description"
                                        />
                                        <TextInput
                                            style={styles.editInput}
                                            value={editedExpense.amount.toString()}
                                            onChangeText={(text) => setEditedExpense({ ...editedExpense, amount: parseFloat(text) })}
                                            placeholder="Amount"
                                            keyboardType="numeric"
                                        />
                                        <Picker
                                            selectedValue={editedExpense.category}
                                            style={styles.editInput}
                                            onValueChange={(itemValue) => setEditedExpense({ ...editedExpense, category: itemValue })}
                                        >
                                            <Picker.Item label="Select Category" value="" />
                                            {categories.map((cat, index) => (
                                                <Picker.Item key={index} label={cat} value={cat} />
                                            ))}
                                        </Picker>
                                        <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveEdit(expense._id)}>
                                            <Text style={styles.saveButtonText}>Save</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.expenseDescription}>{expense.description}</Text>
                                        <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity style={styles.editButton} onPress={() => toggleEditMode(expenseIndex)}>
                                                <Text style={styles.editButtonText}>Edit</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteExpense(expenseIndex)}>
                                                <Text style={styles.deleteButtonText}>Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.floatingButton} onPress={() => setShowInputExpense(true)}>
                <Text style={styles.floatingButtonText}>+</Text>
            </TouchableOpacity>
            <Modal
                visible={showInputExpense}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowInputExpense(false)}
            >
                <View style={styles.popupOverlay}>
                    <View style={styles.popupContainer}>
                        <Text style={styles.popupTitle}>Add New Expense</Text>
                        <TextInput
                            style={styles.popupInput}
                            value={newExpense.description}
                            onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
                            placeholder="Description"
                        />
                        <TextInput
                            style={styles.popupInput}
                            value={newExpense.amount}
                            onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
                            placeholder="Amount"
                            keyboardType="numeric"
                        />
                        <Picker
                            selectedValue={newExpense.category}
                            style={styles.popupInput}
                            onValueChange={(itemValue) => setNewExpense({ ...newExpense, category: itemValue })}
                        >
                            <Picker.Item label="Select Category" value="" />
                            {categories.map((cat, index) => (
                                <Picker.Item key={index} label={cat} value={cat} />
                            ))}
                        </Picker>
                        <TouchableOpacity style={styles.popupSaveButton} onPress={handleAddExpense}>
                            <Text style={styles.popupSaveButtonText}>Add Expense</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.popupCloseButton} onPress={() => setShowInputExpense(false)}>
                            <Text style={styles.popupCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        padding: 10,
    },
    expenseListContent: {
        flexGrow: 1,
        alignItems: 'center',
    },
    categoryTotalsContainer: {
        width: '100%',
        marginBottom: 20,
    },
    categoryTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginVertical: 5,
    },
    categoryTotalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6A5ACD',
    },
    categoryContainer: {
        width: '100%',
        marginBottom: 20,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6A5ACD',
        marginBottom: 10,
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
    actionButtons: {
        flexDirection: 'row',
    },
    editButton: {
        marginRight: 10,
        backgroundColor: '#6A5ACD',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    editButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    deleteButton: {
        backgroundColor: 'red',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    editInput: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 8,
        marginHorizontal: 5,
        width: '100%', // Ensure the input takes full width
    },
    saveButton: {
        backgroundColor: '#6A5ACD',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#6A5ACD',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    floatingButtonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    popupOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    popupContainer: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 10,
    },
    popupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    popupInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 8,
        marginVertical: 5,
        width: '100%',
    },
    popupSaveButton: {
        backgroundColor: '#6A5ACD',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
    },
    popupSaveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    popupCloseButton: {
        marginTop: 10,
        backgroundColor: '#FF6347',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
    },
    popupCloseButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ExpenseTracking;

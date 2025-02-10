import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';

const saving_goals = () => {
    const router = useRouter();
    const [incomes, setIncomes] = useState([]);
    const [showInputIncome, setShowInputIncome] = useState(false);
    const [newIncome, setNewIncome] = useState({ name: '', amount: '', date: '' });
    const [editMode, setEditMode] = useState(null);
    const [deleteMode, setDeleteMode] = useState(null);
    const [editedIncome, setEditedIncome] = useState({ name: '', amount: '', date: '' });

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
            setIncomes(parsedData);
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
                setIncomes(incomes.filter(income => income._id !== id));
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
            return;
        }
        setEditMode(index);
        setDeleteMode(null);
        setEditedIncome(incomes[index]);
    };

    const handleSaveEdit = async (id) => {
        if (!editedIncome.name || !editedIncome.amount || !editedIncome.date) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('name', editedIncome.name);
            formData.append('amount', parseFloat(editedIncome.amount)); // Ensure amount is a number
            formData.append('date', editedIncome.date);

            const response = await fetch(`http://localhost:5000/api/v1.0/salaries/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });

            if (response.ok) {
                const updatedIncomes = incomes.map(income => 
                    income._id === id ? { ...editedIncome, _id: id } : income
                );
                setIncomes(updatedIncomes);
                setEditMode(null);
                setEditedIncome({ name: '', amount: '', date: '' });
            } else {
                Alert.alert('Error', 'Failed to edit income.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while editing the income.');
        }
    };

    const handleAddIncome = async () => {
        if (!newIncome.name || !newIncome.amount) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('name', newIncome.name);
            formData.append('amount', parseFloat(newIncome.amount)); // Ensure amount is a number

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
                    _id: result.url.split('/').pop() // Extract ID from the URL
                };
                setIncomes([...incomes, newIncomeWithId]);
                setNewIncome({ name: '', amount: '', date: '' });
                setShowInputIncome(false);
            } else {
                Alert.alert('Error', 'Failed to add income.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while adding the income.');
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.incomeListContent}>
                {incomes.map((income, index) => (
                    <View key={income._id} style={styles.incomeItem}>
                        {editMode === index ? (
                            <>
                                <TextInput
                                    style={styles.editInput}
                                    value={editedIncome.name}
                                    onChangeText={(text) => setEditedIncome({ ...editedIncome, name: text })}
                                    placeholder="Name"
                                />
                                <TextInput
                                    style={styles.editInput}
                                    value={editedIncome.amount.toString()}
                                    onChangeText={(text) => setEditedIncome({ ...editedIncome, amount: parseFloat(text) })}
                                    placeholder="Amount"
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveEdit(income._id)}>
                                    <Text style={styles.saveButtonText}>Save</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={styles.incomeDescription}>{income.name}</Text>
                                <Text style={styles.incomeAmount}>
                                    ${typeof income.amount === 'number' ? income.amount.toFixed(2) : '0.00'}
                                </Text>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={styles.editButton} onPress={() => toggleEditMode(index)}>
                                        <Text style={styles.editButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteIncome(income._id)}>
                                        <Text style={styles.deleteButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.floatingButton} onPress={() => setShowInputIncome(true)}>
                <Text style={styles.floatingButtonText}>+</Text>
            </TouchableOpacity>
            <Modal
                visible={showInputIncome}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowInputIncome(false)}
            >
                <View style={styles.popupOverlay}>
                    <View style={styles.popupContainer}>
                        <Text style={styles.popupTitle}>Add New Income</Text>
                        <TextInput
                            style={styles.popupInput}
                            value={newIncome.name}
                            onChangeText={(text) => setNewIncome({ ...newIncome, name: text })}
                            placeholder="Name"
                        />
                        <TextInput
                            style={styles.popupInput}
                            value={newIncome.amount}
                            onChangeText={(text) => setNewIncome({ ...newIncome, amount: text })}
                            placeholder="Amount"
                            keyboardType="numeric"
                        />
                        <TouchableOpacity style={styles.popupSaveButton} onPress={handleAddIncome}>
                            <Text style={styles.popupSaveButtonText}>Add Income</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.popupCloseButton} onPress={() => setShowInputIncome(false)}>
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
        padding: 20,
    },
    incomeListContent: {
        paddingBottom: 100,
    },
    incomeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    incomeDescription: {
        fontSize: 16,
    },
    incomeAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    editButton: {
        backgroundColor: '#4CAF50',
        padding: 5,
        borderRadius: 5,
        marginRight: 5,
    },
    editButtonText: {
        color: '#fff',
    },
    deleteButton: {
        backgroundColor: '#f44336',
        padding: 5,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: '#fff',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#2196F3',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingButtonText: {
        color: '#fff',
        fontSize: 24,
    },
    popupOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    popupContainer: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
    },
    popupTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    popupInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    popupSaveButton: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    popupSaveButtonText: {
        color: '#fff',
    },
    popupCloseButton: {
        backgroundColor: '#f44336',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    popupCloseButtonText: {
        color: '#fff',
    },
    editInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 5,
        marginBottom: 5,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 5,
        borderRadius: 5,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
    },
});

export default saving_goals;
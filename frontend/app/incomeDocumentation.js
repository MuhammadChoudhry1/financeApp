import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet, Modal } from 'react-native';
import { useRouter } from 'expo-router';

const saving_goals = () => {
    const router = useRouter();
    const [incomes, setIncomes] = useState([]);
    const [newIncome, setNewIncome] = useState({ name: '', amount: '' });
    const [editMode, setEditMode] = useState(null);
    const [editedIncome, setEditedIncome] = useState({ name: '', amount: '' });

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
            return;
        }
        setEditMode(index);
        setEditedIncome(incomes[index]);
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
                    id: result.id // Use the returned ID
                };
                setIncomes([...incomes, newIncomeWithId]);
                setNewIncome({ name: '', amount: '' });
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
            <Button
                title="Add Income"
                onPress={handleAddIncome}
            />

            <FlatList
                data={incomes}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <View style={styles.incomeItem}>
                        {editMode === index ? (
                            <>
                                <TextInput
                                    style={styles.input}
                                    value={editedIncome.name}
                                    onChangeText={(text) => setEditedIncome({ ...editedIncome, name: text })}
                                    placeholder="Name"
                                />
                                <TextInput
                                    style={styles.input}
                                    value={editedIncome.amount.toString()}
                                    onChangeText={(text) => setEditedIncome({ ...editedIncome, amount: parseFloat(text) })}
                                    placeholder="Amount"
                                    keyboardType="numeric"
                                />
                                <Button title="Save" onPress={() => handleSaveEdit(item.id)} />
                            </>
                        ) : (
                            <>
                                <Text>{item.name}</Text>
                                <Text>Amount: ${item.amount.toFixed(2)}</Text>
                                <Text>Date: {item.date}</Text>
                                <Button title="Edit" onPress={() => toggleEditMode(index)} />
                                <Button title="Delete" onPress={() => handleDeleteIncome(item.id)} />
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
    },
});

export default saving_goals;
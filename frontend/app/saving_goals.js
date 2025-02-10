import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

const saving_goals = () => {
    const router = useRouter();
    const [incomes, setIncomes] = useState([]);
    const [showInputIncome, setShowInputIncome] = useState(false);
    const [newIncome, setNewIncome] = useState({ description: '', amount: '', category: '' });
    const [editMode, setEditMode] = useState(null);
    const [deleteMode, setDeleteMode] = useState(null);
    const [editedIncome, setEditedIncome] = useState({ description: '', amount: '', category: '' });
    const [categories] = useState(['Salary', 'Business', 'Investments', 'Other']);

    useEffect(() => {
        fetchIncomes();
    }, []);

    const fetchIncomes = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/v1.0/saving_goals');
            const data = await response.json();
            const parsedData = data.map(income => ({
                ...income,
                amount: parseFloat(income.target_amount) // Map 'target_amount' to 'amount'
            }));
            setIncomes(parsedData);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch incomes.');
        }
    };

    const handleDeleteIncome = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/v1.0/saving_goals/${id}`, {
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
        setEditedIncome(incomes[index]);
    };

    const handleSaveEdit = async (id) => {
        if (!editedIncome.description || !editedIncome.amount || !editedIncome.category) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('name', editedIncome.description); // Map 'description' to 'name'
            formData.append('target_amount', editedIncome.amount); // Map 'amount' to 'target_amount'
            formData.append('category', editedIncome.category); // Optional field
            formData.append('date', new Date().toISOString()); // Add current date

            const response = await fetch(`http://localhost:5000/api/v1.0/saving_goals/${id}`, {
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
                setEditedIncome({ description: '', amount: '', category: '' });
            } else {
                Alert.alert('Error', 'Failed to edit income.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while editing the income.');
        }
    };

    const handleAddIncome = async () => {
        if (!newIncome.description || !newIncome.amount || !newIncome.category) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }

        try {
            const formData = new URLSearchParams();
            formData.append('name', newIncome.description); // Map 'description' to 'name'
            formData.append('target_amount', newIncome.amount); // Map 'amount' to 'target_amount'
            formData.append('category', newIncome.category); // Optional field

            const response = await fetch('http://localhost:5000/api/v1.0/saving_goals', {
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
                    amount: parseFloat(newIncome.amount), 
                    _id: result.url.split('/').pop() // Extract ID from the URL
                };
                setIncomes([...incomes, newIncomeWithId]);
                setNewIncome({ description: '', amount: '', category: '' });
                setShowInputIncome(false);
            } else {
                Alert.alert('Error', 'Failed to add income.');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while adding the income.');
        }
    };

    const groupedIncomes = incomes.reduce((acc, income) => {
        if (!acc[income.category]) {
            acc[income.category] = [];
        }
        acc[income.category].push(income);
        return acc;
    }, {});

    const categoryTotals = Object.keys(groupedIncomes).reduce((acc, category) => {
        const total = groupedIncomes[category].reduce((sum, income) => sum + parseFloat(income.amount), 0);
        acc[category] = total;
        return acc;
    }, {});

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.incomeListContent}>
                <View style={styles.categoryTotalsContainer}>
                    {Object.keys(categoryTotals).map((category, index) => (
                        <View key={index} style={styles.categoryTotal}>
                            <Text style={styles.categoryTotalText}>{category}: ${categoryTotals[category].toFixed(2)}</Text>
                        </View>
                    ))}
                </View>
                {Object.keys(groupedIncomes).map((category, index) => (
                    <View key={index} style={styles.categoryContainer}>
                        <Text style={styles.categoryTitle}>{category}</Text>
                        {groupedIncomes[category].map((income, incomeIndex) => (
                            <View key={income._id} style={styles.incomeItem}>
                                {editMode === incomeIndex ? (
                                    <>
                                        <TextInput
                                            style={styles.editInput}
                                            value={editedIncome.description}
                                            onChangeText={(text) => setEditedIncome({ ...editedIncome, description: text })}
                                            placeholder="Description"
                                        />
                                        <TextInput
                                            style={styles.editInput}
                                            value={editedIncome.amount.toString()}
                                            onChangeText={(text) => setEditedIncome({ ...editedIncome, amount: parseFloat(text) })}
                                            placeholder="Amount"
                                            keyboardType="numeric"
                                        />
                                        <Picker
                                            selectedValue={editedIncome.category}
                                            style={styles.editInput}
                                            onValueChange={(itemValue) => setEditedIncome({ ...editedIncome, category: itemValue })}
                                        >
                                            <Picker.Item label="Select Category" value="" />
                                            {categories.map((cat, index) => (
                                                <Picker.Item key={index} label={cat} value={cat} />
                                            ))}
                                        </Picker>
                                        <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveEdit(income._id)}>
                                            <Text style={styles.saveButtonText}>Save</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.incomeDescription}>{income.description}</Text>
                                        <Text style={styles.incomeAmount}>${income.amount.toFixed(2)}</Text>
                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity style={styles.editButton} onPress={() => toggleEditMode(incomeIndex)}>
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
                            value={newIncome.description}
                            onChangeText={(text) => setNewIncome({ ...newIncome, description: text })}
                            placeholder="Description"
                        />
                        <TextInput
                            style={styles.popupInput}
                            value={newIncome.amount}
                            onChangeText={(text) => setNewIncome({ ...newIncome, amount: text })}
                            placeholder="Amount"
                            keyboardType="numeric"
                        />
                        <Picker
                            selectedValue={newIncome.category}
                            style={styles.popupInput}
                            onValueChange={(itemValue) => setNewIncome({ ...newIncome, category: itemValue })}
                        >
                            <Picker.Item label="Select Category" value="" />
                            {categories.map((cat, index) => (
                                <Picker.Item key={index} label={cat} value={cat} />
                            ))}
                        </Picker>
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
        backgroundColor: '#f8f8f8',
        padding: 10,
    },
    incomeListContent: {
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
    incomeItem: {
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
    incomeDescription: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    incomeAmount: {
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
        width: '100%',
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

export default saving_goals;

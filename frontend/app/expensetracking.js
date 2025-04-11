import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Alert, StyleSheet, TouchableOpacity, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import Navigation2 from './components/Navagation/Navagation2'; // Ensure Navigation2 is imported
import HeaderMenu from './components/Common/HeaderMenu'; // Ensure HeaderMenu is imported
import ExpenseForm from './components/Expenses/ExpenseForm';
import ExpenseItem from './components/Expenses/ExpenseItem';

const ExpenseTracking = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: '' });
  const [editMode, setEditMode] = useState(null);
  const [editedExpense, setEditedExpense] = useState({ description: '', amount: '', category: '' });
  const [categories] = useState(['Food', 'Transport', 'Entertainment', 'Utilities', 'Investments']);
  const [showInputExpense, setShowInputExpense] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const API_BASE = 'http://192.168.1.214:5000/api/v1.0/expenses';

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); 
      const response = await fetch(API_BASE, {
        headers: { 'x-access-token': token }, 
      });
      const data = await response.json();
      const parsedData = data.map(expense => ({
        ...expense,
        amount: parseFloat(expense.amount),
      }));
      setExpenses(parsedData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch expenses.');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { 'x-access-token': token }, 
      });

      if (response.ok) {
        setExpenses(expenses.filter(expense => expense.id !== id));
      } else {
        Alert.alert('Error', 'Failed to delete expense.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the expense.');
    }
  };

  const toggleEditMode = (index) => {
    if (editMode === index) {
      setEditMode(null);
      setShowEditModal(false);
      return;
    }
    setEditMode(index);
    setEditedExpense(expenses[index]);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (id) => {
    if (!editedExpense.description || !editedExpense.amount || !editedExpense.category) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token'); 
      const formData = new URLSearchParams();
      formData.append('description', editedExpense.description);
      formData.append('amount', editedExpense.amount.toString());
      formData.append('category', editedExpense.category);

      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-access-token': token,
        },
        body: formData.toString(),
      });

      if (response.ok) {
        const updatedExpenses = expenses.map(expense =>
          expense.id === id
            ? { ...editedExpense, id, amount: parseFloat(editedExpense.amount) }
            : expense
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
      const token = await AsyncStorage.getItem('token'); 
      const formData = new URLSearchParams();
      formData.append('description', newExpense.description);
      formData.append('amount', newExpense.amount);
      formData.append('category', newExpense.category);

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-access-token': token,
        },
        body: formData.toString(),
      });

      if (response.ok) {
        const result = await response.json();
        const newExpenseWithId = {
          ...newExpense,
          amount: parseFloat(newExpense.amount),
          id: result.id,
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderMenu /> {/* Add HeaderMenu at the top */}
      <View style={styles.container}>
        <Text style={styles.title}>Expenses</Text>

        <Navigation2 /> {/* Add Navigation2 component */}

        <View style={{ flex: 45 }}>
          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <ExpenseItem
                item={item}
                onDelete={() => handleDeleteExpense(item.id)}
                onEdit={() => toggleEditMode(index)}
              />
            )}
          />
        </View>

        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.roundButton} onPress={() => setShowInputExpense(true)}>
            <Text style={styles.buttonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        {showInputExpense && (
          <ExpenseForm
            title="Add Expense"
            values={newExpense}
            onChange={setNewExpense}
            onSubmit={handleAddExpense}
            onCancel={() => setShowInputExpense(false)}
            categories={categories}
          />
        )}

        {showEditModal && (
          <ExpenseForm
            title="Edit Expense"
            values={editedExpense}
            onChange={setEditedExpense}
            onSubmit={() => handleSaveEdit(editedExpense.id)}
            onCancel={() => setShowEditModal(false)}
            categories={categories}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6A5ACD',
    textAlign: 'center',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
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
});

export default ExpenseTracking;
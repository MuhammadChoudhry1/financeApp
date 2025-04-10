import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, Alert, StyleSheet,
  TouchableOpacity, ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

const BudgetTracking = () => {
  const navigation = useNavigation();
  const [budgets, setBudgets] = useState([]);
  const [newBudget, setNewBudget] = useState({ category: '', monthly_limit: '' });
  const [editMode, setEditMode] = useState(null);
  const [editedBudget, setEditedBudget] = useState({ category: '', monthly_limit: '' });
  const [categories] = useState(['Entertainment', 'Groceries', 'Transport', 'Dining']);
  const [showInputBudget, setShowInputBudget] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const API_BASE = 'http://192.168.1.214:5000/api/v1.0/budgets';

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    fetchBudgets();
  }, []);

  const sendNotification = async (message) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Budget Alert!',
        body: message,
        sound: 'default',
      },
      trigger: null,
    });
  };

  const fetchBudgets = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(API_BASE, {
        headers: { 'x-access-token': token },
      });
      const data = await response.json();

      const exceededBudgets = data.filter(budget => budget.exceeded);
      if (exceededBudgets.length > 0) {
        const message = `You have exceeded your budget for: ${exceededBudgets.map(b => b.category).join(', ')}.`;
        sendNotification(message);
      }

      setBudgets(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch budgets.');
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { 'x-access-token': token },
      });

      if (response.ok) {
        setBudgets(budgets.filter(budget => budget.id !== id));
      } else {
        Alert.alert('Error', 'Failed to delete budget.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the budget.');
    }
  };

  const toggleEditMode = (index) => {
    if (editMode === index) {
      setEditMode(null);
      setShowEditModal(false);
      return;
    }
    setEditMode(index);
    setEditedBudget(budgets[index]);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (id) => {
    if (!editedBudget.category || !editedBudget.monthly_limit) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new URLSearchParams();
      formData.append('category', editedBudget.category);
      formData.append('monthly_limit', editedBudget.monthly_limit);

      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-access-token': token,
        },
        body: formData.toString(),
      });

      if (response.ok) {
        const updatedBudgets = budgets.map(budget =>
          budget.id === id
            ? { ...editedBudget, id }
            : budget
        );
        setBudgets(updatedBudgets);
        setEditMode(null);
        setEditedBudget({ category: '', monthly_limit: '' });
        setShowEditModal(false);
      } else {
        Alert.alert('Error', 'Failed to edit budget.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while editing the budget.');
    }
  };

  const handleAddBudget = async () => {
    if (!newBudget.category || !newBudget.monthly_limit) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new URLSearchParams();
      formData.append('category', newBudget.category);
      formData.append('monthly_limit', newBudget.monthly_limit);

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
        const newBudgetWithId = { ...newBudget, id: result.id };
        setBudgets([...budgets, newBudgetWithId]);
        setNewBudget({ category: '', monthly_limit: '' });
        setShowInputBudget(false);
      } else {
        Alert.alert('Error', 'Failed to add budget.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while adding the budget.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Budgets</Text>

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
        <TouchableOpacity style={styles.navBarItem} onPress={() => navigation.navigate('budgetOverview')}>
          <Text style={styles.navBarText}>Budget Overview</Text> {/* New navigation option */}
        </TouchableOpacity>
      </ScrollView>

      <View style={{ flex: 45 }}>
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.budgetItem}>
              <View>
                <Text>Category: {item.category}</Text>
                <Text>Monthly Limit: ${parseFloat(item.monthly_limit).toFixed(2)}</Text>
                <Text>Used Amount: ${parseFloat(item.used_amount).toFixed(2)}</Text> {/* Display used amount */}
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.roundButton} onPress={() => handleDeleteBudget(item.id)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.roundButton} onPress={() => toggleEditMode(index)}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.roundButton} onPress={() => setShowInputBudget(true)}>
          <Text style={styles.buttonText}>Add Budget</Text>
        </TouchableOpacity>
      </View>

      {showInputBudget && (
        <View style={styles.modalContainer}>
          <Picker
            selectedValue={newBudget.category}
            style={styles.input}
            onValueChange={(itemValue) => setNewBudget({ ...newBudget, category: itemValue })}
          >
            <Picker.Item label="Select Category" value="" />
            {categories.map((cat, index) => (
              <Picker.Item key={index} label={cat} value={cat} />
            ))}
          </Picker>
          <TextInput
            style={styles.input}
            placeholder="Monthly Limit"
            value={newBudget.monthly_limit}
            onChangeText={(text) => setNewBudget({ ...newBudget, monthly_limit: text })}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.roundButton} onPress={handleAddBudget}>
            <Text style={styles.buttonText}>Add Budget</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.roundButton} onPress={() => setShowInputBudget(false)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {showEditModal && (
        <View style={styles.modalContainer}>
          <Picker
            selectedValue={editedBudget.category}
            style={styles.input}
            onValueChange={(itemValue) => setEditedBudget({ ...editedBudget, category: itemValue })}
          >
            <Picker.Item label="Select Category" value="" />
            {categories.map((cat, index) => (
              <Picker.Item key={index} label={cat} value={cat} />
            ))}
          </Picker>
          <TextInput
            style={styles.input}
            value={editedBudget.monthly_limit.toString()}
            onChangeText={(text) => setEditedBudget({ ...editedBudget, monthly_limit: text })}
            placeholder="Monthly Limit"
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.roundButton} onPress={() => handleSaveEdit(editedBudget.id)}>
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
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#6A5ACD' },
  input: {
    height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 10,
    paddingHorizontal: 10, borderRadius: 5,
  },
  budgetItem: {
    padding: 15, backgroundColor: '#fff', marginBottom: 10, borderRadius: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 5, elevation: 2,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  buttonContainer: { flexDirection: 'column', gap: 10 },
  roundButton: {
    backgroundColor: '#6A5ACD', borderRadius: 20,
    paddingVertical: 10, paddingHorizontal: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 14 },
  addButtonContainer: { position: 'absolute', bottom: 20, left: 20 },
  modalContainer: {
    position: 'absolute', top: '50%', left: '50%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
    width: 300, backgroundColor: '#fff', padding: 20, borderRadius: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 5, elevation: 2,
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

export default BudgetTracking;

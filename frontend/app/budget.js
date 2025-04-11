import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, Alert, StyleSheet,
  TouchableOpacity, ScrollView, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import Navigation2 from './components/Navagation/Navagation2'; // Import Navigation2
import HeaderMenu from './components/Common/HeaderMenu'; // Import HeaderMenu
import BudgetForm from './components/Budget/BudgetForm'; // Import BudgetForm
import BudgetItem from './components/Budget/BudgetItem'; // Import BudgetItem

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
    if (Platform.OS !== 'web') { // Ensure notifications are not scheduled on the web
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Budget Alert!',
          body: message,
          sound: 'default',
        },
        trigger: null,
      });
    } else {
      console.warn('Notifications are not supported on the web platform.');
    }
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
      <HeaderMenu /> {/* Add HeaderMenu at the top */}
      <Text style={styles.title}>Budgets</Text>

      <Navigation2 /> {/* Add Navigation2 component */}

      <View style={{ flex: 45 }}>
        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <BudgetItem
              item={item}
              onDelete={() => handleDeleteBudget(item.id)}
              onEdit={() => toggleEditMode(index)}
            />
          )}
        />
      </View>

      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.roundButton} onPress={() => setShowInputBudget(true)}>
          <Text style={styles.buttonText}>Add Budget</Text>
        </TouchableOpacity>
      </View>

      {showInputBudget && (
        <BudgetForm
          title="Add Budget"
          values={newBudget}
          categories={categories}
          onChange={setNewBudget}
          onSubmit={handleAddBudget}
          onCancel={() => setShowInputBudget(false)}
        />
      )}

      {showEditModal && (
        <BudgetForm
          title="Edit Budget"
          values={editedBudget}
          categories={categories}
          onChange={setEditedBudget}
          onSubmit={() => handleSaveEdit(editedBudget.id)}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </View>
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

});

export default BudgetTracking;

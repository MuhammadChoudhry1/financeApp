import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import Navigation2 from './components/Navagation/Navagation2';
import HeaderMenu from './components/Common/HeaderMenu';
import SavingGoalItem from './components/SavingGoals/SavingGoalItem'; // Import SavingGoalItem
import SavingGoalForm from './components/SavingGoals/SavingGoalForm'; // Import SavingGoalForm

const App = () => {
  const [savingGoals, setSavingGoals] = useState([]);
  const [formValues, setFormValues] = useState({ description: '', amount: '', category: '', status: 'save' });
  const [editingId, setEditingId] = useState(null);
  const [showInputExpense, setShowInputExpense] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchSavingGoals = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); 
      if (!token) {
        throw new Error('Authentication token is missing.');
      }

      const response = await fetch('http://192.168.1.214:5000/api/v1.0/saving_goals', { 
        headers: { 'x-access-token': token },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch saving goals.');
      }

      const data = await response.json();
      const parsedData = (data || []).map(goal => ({
        ...goal,
        amount: parseFloat(goal.amount), 
      }));
      setSavingGoals(parsedData);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch saving goals.');
    }
  };

  const handleAddOrUpdateSavingGoal = async () => {
    const { description, amount, category, status } = formValues;

    if (!description || !amount || !category) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Amount must be a number.');
      return;
    }

    const allowedStatuses = ['save', 'ongoing', 'completed'];
    if (!allowedStatuses.includes(status)) {
      Alert.alert('Error', 'Invalid status value.');
      return;
    }

    const savingGoalData = {
      description,
      amount: parseFloat(amount),
      category,
      status,
    };

    const url = editingId ? `http://192.168.1.214:5000/api/v1.0/saving_goals/${editingId}` : 'http://192.168.1.214:5000/api/v1.0/saving_goals';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const token = await AsyncStorage.getItem('token'); // Ensure token is retrieved
      if (!token) {
        throw new Error('Authentication token is missing.');
      }

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': token, // Include token in headers
        },
        body: JSON.stringify(savingGoalData),
      });

      if (response.ok) {
        fetchSavingGoals();
        resetForm();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'Failed to save saving goal.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save saving goal.');
    }
  };

  const handleDeleteSavingGoal = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token'); // Ensure token is retrieved
      if (!token) {
        throw new Error('Authentication token is missing.');
      }

      const response = await fetch(`http://192.168.1.214:5000/api/v1.0/saving_goals/${id}`, { 
        method: 'DELETE',
        headers: { 'x-access-token': token }, // Include token in headers
      });

      if (response.ok) {
        setSavingGoals(savingGoals.filter(goal => goal.id !== id));
      } else {
        Alert.alert('Error', 'Failed to delete saving goal.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the saving goal.');
    }
  };

  const handleEditSavingGoal = (goal) => {
    setFormValues({
      description: goal.description,
      amount: goal.amount.toString(),
      category: goal.category,
      status: goal.status,
    });
    setEditingId(goal.id);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormValues({ description: '', amount: '', category: '', status: 'save' });
    setEditingId(null);
    setShowInputExpense(false);
    setShowEditModal(false);
  };

  useEffect(() => {
    fetchSavingGoals();
  }, []);

  return (
    <View style={styles.safeArea}>
      <HeaderMenu />
      <View style={styles.container}>
        <Text style={styles.title}>Saving Goals</Text>

        <Navigation2 />

        <View style={{ flex: 45 }}>
          <FlatList
            data={savingGoals}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <SavingGoalItem
                item={item}
                onDelete={() => handleDeleteSavingGoal(item.id)}
                onEdit={() => handleEditSavingGoal(item)}
              />
            )}
          />
        </View>

        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.roundButton} onPress={() => setShowInputExpense(true)}>
            <Text style={styles.buttonText}>Add Saving Goal</Text>
          </TouchableOpacity>
        </View>

        {showInputExpense && (
          <SavingGoalForm
            title="Add Saving Goal"
            values={formValues}
            onChange={setFormValues}
            onSubmit={handleAddOrUpdateSavingGoal}
            onCancel={resetForm}
          />
        )}

        {showEditModal && (
          <SavingGoalForm
            title="Edit Saving Goal"
            values={formValues}
            onChange={setFormValues}
            onSubmit={handleAddOrUpdateSavingGoal}
            onCancel={resetForm}
          />
        )}
      </View>
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
    padding: 20,
    backgroundColor: '#fff',
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

export default App;
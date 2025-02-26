import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const App = () => {
  const [savingGoals, setSavingGoals] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('save');
  const [editingId, setEditingId] = useState(null);

  // Fetch all saving goals
  const fetchSavingGoals = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1.0/saving_goals');
      const data = await response.json();
      const parsedData = data.map(goal => ({
        ...goal,
        amount: parseFloat(goal.amount), // Ensure amount is a float
      }));
      setSavingGoals(parsedData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch saving goals.');
    }
  };

  const handleAddOrUpdateSavingGoal = async () => {
    // Validate required fields
    if (!description || !amount || !category) {
        Alert.alert('Error', 'All fields are required.');
        return;
    }

    // Validate amount is a number
    if (isNaN(parseFloat(amount))) {
        Alert.alert('Error', 'Amount must be a number.');
        return;
    }

    // Prepare the payload
    const savingGoalData = {
        description,
        amount: parseFloat(amount),
        category,
        status,
    };

    console.log('Sending payload:', savingGoalData); // Log the payload

    const url = editingId ? `http://localhost:5000/api/v1.0/saving_goals/${editingId}` : 'http://localhost:5000/api/v1.0/saving_goals';
    const method = editingId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
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

  // Delete a saving goal
  const handleDeleteSavingGoal = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1.0/saving_goals/${id}`, {
        method: 'DELETE',
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

  // Edit a saving goal (pre-fill form)
  const handleEditSavingGoal = (goal) => {
    setDescription(goal.description);
    setAmount(goal.amount.toString());
    setCategory(goal.category);
    setStatus(goal.status);
    setEditingId(goal.id);
  };

  // Reset form fields
  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setStatus('save');
    setEditingId(null);
  };

  // Fetch saving goals on component mount
  useEffect(() => {
    fetchSavingGoals();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saving Goals</Text>

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <Picker
        selectedValue={status}
        style={styles.input}
        onValueChange={(itemValue) => setStatus(itemValue)}
      >
        <Picker.Item label="Save" value="save" />
        <Picker.Item label="Ongoing" value="ongoing" />
        <Picker.Item label="Completed" value="completed" />
      </Picker>

      <Button
        title={editingId ? "Update Saving Goal" : "Add Saving Goal"}
        onPress={handleAddOrUpdateSavingGoal}
      />

      <FlatList
        data={savingGoals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.goalItem}>
            <Text>{item.description}</Text>
            <Text>Amount: ${item.amount}</Text>
            <Text>Category: {item.category}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Date: {item.date}</Text>
            <Button title="Edit" onPress={() => handleEditSavingGoal(item)} />
            <Button title="Delete" onPress={() => handleDeleteSavingGoal(item.id)} />
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
  goalItem: {
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

export default App;
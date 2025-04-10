import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { useNavigation } from '@react-navigation/native'; 

const App = () => {
  const navigation = useNavigation(); 
  const [savingGoals, setSavingGoals] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('save');
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
        headers: {
          'x-access-token': token, 
        },
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

    console.log('Sending payload:', savingGoalData); 

    const url = editingId ? `http://192.168.1.214:5000/api/v1.0/saving_goals/${editingId}` : 'http://192.168.1.214:5000/api/v1.0/saving_goals'; // Updated URL
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
      const response = await fetch(`http://192.168.1.214:5000/api/v1.0/saving_goals/${id}`, { 
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

  const handleEditSavingGoal = (goal) => {
    setDescription(goal.description);
    setAmount(goal.amount.toString());
    setCategory(goal.category);
    setStatus(goal.status);
    setEditingId(goal.id);
    setShowEditModal(true); 
  };

  // Reset form fields
  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setStatus('save');
    setEditingId(null);
    setShowInputExpense(false);
    setShowEditModal(false);
  };

  useEffect(() => {
    fetchSavingGoals();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saving Goals</Text>

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
      </ScrollView>

<View style={{flex:45}}>

      <FlatList
        data={savingGoals}
        keyExtractor={(item) => item.id.toString()} 
        renderItem={({ item }) => (
          <View style={styles.goalItem}>
            <View>
              <Text>{item.description}</Text>
              <Text>Amount: ${item.amount}</Text>
              <Text>Category: {item.category}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Date: {item.date}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.roundButton} onPress={() => handleDeleteSavingGoal(item.id)}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.roundButton} onPress={() => handleEditSavingGoal(item)}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      </View>
  
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.roundButton} onPress={() => setShowInputExpense(true)}>
          <Text style={styles.buttonText}>Add Saving Goal</Text>
        </TouchableOpacity>
      </View>
  
      {showInputExpense && (
        <View style={styles.modalContainer}>
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
          <View style={styles.buttonSpacing}> 
            <TouchableOpacity style={styles.roundButton} onPress={handleAddOrUpdateSavingGoal}>
              <Text style={styles.buttonText}>Add Saving Goal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.roundButton} onPress={resetForm}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
  
      {showEditModal && (
        <View style={styles.modalContainer}>
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
          <View style={styles.buttonSpacing}> 
            <TouchableOpacity style={styles.roundButton} onPress={handleAddOrUpdateSavingGoal}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.roundButton} onPress={() => setShowEditModal(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'column', 
    gap: 10, 
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
  modalContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -150 }],
    width: 300,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  buttonSpacing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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

export default App;
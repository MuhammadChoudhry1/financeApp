import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Alert, StyleSheet, TouchableOpacity, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavigationBar from './components/Navagation/Navagation2'; // Import NavigationBar
import HeaderMenu from './components/Common/HeaderMenu'; // Import HeaderMenu
import IncomeItem from './components/Income/IncomeItem'; // Import IncomeItem
import IncomeForm from './components/Income/IncomeForm'; // Import IncomeForm

const IncomeDocumentation = () => {
  const [incomeList, setIncomeList] = useState([]);
  const [newIncome, setNewIncome] = useState({ name: '', amount: '' });
  const [editIndex, setEditIndex] = useState(null);
  const [currentEdit, setCurrentEdit] = useState({ name: '', amount: '' });
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => {
    fetchIncomeData();
  }, []);

  const fetchIncomeData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token not found. Please log in again.');

      const response = await fetch('http://192.168.1.214:5000/api/v1.0/salaries', {
        headers: { 'x-access-token': token },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const formattedData = data.map(income => ({
        ...income,
        amount: parseFloat(income.amount),
      }));
      setIncomeList(formattedData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      Alert.alert('Error', `Failed to fetch income data: ${error.message}`);
    }
  };

  const deleteIncome = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/v1.0/salaries/${id}`, {
        method: 'DELETE',
        headers: { 'x-access-token': token },
      });
      if (response.ok) {
        setIncomeList(incomeList.filter(income => income.id !== id));
      } else {
        Alert.alert('Error', 'Failed to delete income.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while deleting the income.');
    }
  };

  const toggleEditModal = (index) => {
    if (editIndex === index) {
      setEditIndex(null);
      setEditModalVisible(false);
      return;
    }
    setEditIndex(index);
    setCurrentEdit(incomeList[index]);
    setEditModalVisible(true);
  };

  const saveIncomeEdit = async (id) => {
    if (!currentEdit.name || !currentEdit.amount) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new URLSearchParams();
      formData.append('name', currentEdit.name);
      formData.append('amount', parseFloat(currentEdit.amount));

      const response = await fetch(`http://localhost:5000/api/v1.0/salaries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-access-token': token,
        },
        body: formData.toString(),
      });

      if (response.ok) {
        setIncomeList(incomeList.map(income => income.id === id ? { ...income, ...currentEdit } : income));
        setEditIndex(null);
        setEditModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to update income.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while updating the income.');
    }
  };

  const addIncome = async () => {
    if (!newIncome.name || !newIncome.amount) {
      Alert.alert('Error', 'Name and amount are required.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new URLSearchParams();
      formData.append('name', newIncome.name);
      formData.append('amount', parseFloat(newIncome.amount));
      formData.append('date', new Date().toISOString());

      const response = await fetch('http://localhost:5000/api/v1.0/salaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-access-token': token,
        },
        body: formData.toString(),
      });

      if (response.ok) {
        const result = await response.json();
        const newIncomeEntry = {
          ...newIncome,
          amount: parseFloat(newIncome.amount),
          id: result.id,
          date: result.date,
        };
        setIncomeList([newIncomeEntry, ...incomeList]);
        setNewIncome({ name: '', amount: '' });
        setAddModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to add income.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while adding the income.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderMenu /> {/* Add HeaderMenu at the top */}
      <View style={styles.container}>
        <Text style={styles.title}>Income Documentation</Text>
        <NavigationBar /> {/* Add NavigationBar */}
        <View style={{ flex: 45 }}>
          <FlatList
            data={incomeList}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <IncomeItem
                item={item}
                onDelete={() => deleteIncome(item.id)}
                onEdit={() => toggleEditModal(index)}
              />
            )}
          />
        </View>
        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.roundButton} onPress={() => setAddModalVisible(true)}>
            <Text style={styles.buttonText}>Add Income</Text>
          </TouchableOpacity>
        </View>
        {isAddModalVisible && (
          <IncomeForm
            title="Add Income"
            values={newIncome}
            onChange={setNewIncome}
            onSubmit={addIncome}
            onCancel={() => setAddModalVisible(false)}
          />
        )}
        {isEditModalVisible && (
          <IncomeForm
            title="Edit Income"
            values={currentEdit}
            onChange={setCurrentEdit}
            onSubmit={() => saveIncomeEdit(currentEdit.id)}
            onCancel={() => setEditModalVisible(false)}
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

export default IncomeDocumentation;

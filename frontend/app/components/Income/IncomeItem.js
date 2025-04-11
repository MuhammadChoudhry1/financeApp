import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const IncomeItem = ({ item, onDelete, onEdit }) => {
  return (
    <View style={styles.incomeItem}>
      <View>
        <Text>{item.name}</Text>
        <Text>Amount: ${item.amount.toFixed(2)}</Text>
        <Text>Date: {item.date}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.roundButton} onPress={onDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundButton} onPress={onEdit}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default IncomeItem;

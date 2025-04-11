import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const IncomeForm = ({ title, values, onChange, onSubmit, onCancel }) => {
  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>{title}</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={values.name}
        onChangeText={(text) => onChange({ ...values, name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={values.amount.toString()}
        onChangeText={(text) => {
          const amount = parseFloat(text);
          onChange({ ...values, amount: isNaN(amount) ? '' : amount });
        }}
        keyboardType="numeric"
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.roundButton} onPress={onSubmit}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.roundButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6A5ACD',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundButton: {
    backgroundColor: '#6A5ACD',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default IncomeForm;

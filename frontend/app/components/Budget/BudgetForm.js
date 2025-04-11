// components/Budget/BudgetForm.js
import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const BudgetForm = ({ title, values, categories, onChange, onSubmit, onCancel }) => {
  return (
    <View style={styles.modalContainer}>
      <Picker
        selectedValue={values.category}
        style={styles.input}
        onValueChange={(itemValue) => onChange({ ...values, category: itemValue })}
      >
        <Picker.Item label="Select Category" value="" />
        {categories.map((cat, index) => (
          <Picker.Item key={index} label={cat} value={cat} />
        ))}
      </Picker>
      <TextInput
        style={styles.input}
        placeholder="Monthly Limit"
        value={values.monthly_limit}
        onChangeText={(text) => onChange({ ...values, monthly_limit: text })}
        keyboardType="numeric"
      />
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.roundButton} onPress={onSubmit}>
          <Text style={styles.buttonText}>{title}</Text>
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
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  roundButton: {
    backgroundColor: '#6A5ACD',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
});

export default BudgetForm;

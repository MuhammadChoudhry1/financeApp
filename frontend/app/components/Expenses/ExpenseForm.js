import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const ExpenseForm = ({
  title,
  values,
  onChange,
  onSubmit,
  onCancel,
  categories = [],
}) => {
  return (
    <View style={styles.modalContainer}>
      <Text style={styles.title}>{title}</Text>
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={values.description}
        onChangeText={(text) => onChange({ ...values, description: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={values.amount}
        onChangeText={(text) => onChange({ ...values, amount: text })}
        keyboardType="numeric"
      />
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
      <View style={styles.buttonSpacing}>
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
    marginBottom: 10,
    color: '#6A5ACD',
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
  roundButton: {
    backgroundColor: '#6A5ACD',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
  buttonSpacing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default ExpenseForm;

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const SavingGoalForm = ({ title, values, onChange, onSubmit, onCancel }) => {
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
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={values.category}
        onChangeText={(text) => onChange({ ...values, category: text })}
      />
      <Picker
        selectedValue={values.status}
        style={styles.input}
        onValueChange={(itemValue) => onChange({ ...values, status: itemValue })}
      >
        <Picker.Item label="Save" value="save" />
        <Picker.Item label="Ongoing" value="ongoing" />
        <Picker.Item label="Completed" value="completed" />
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
  buttonSpacing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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

export default SavingGoalForm;

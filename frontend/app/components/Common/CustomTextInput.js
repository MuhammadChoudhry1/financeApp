// components/Common/CustomTextInput.js
import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

const CustomTextInput = ({ value, onChangeText, placeholder, secureTextEntry, keyboardType = 'default' }) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
    keyboardType={keyboardType}
    autoCapitalize="none"
  />
);

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'white',
  },
});

export default CustomTextInput;

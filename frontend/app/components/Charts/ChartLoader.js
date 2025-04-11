import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ChartLoader = ({ message = 'Loading data...' }) => {
  return (
    <View style={styles.container}>
      <MaterialIcons name="refresh" size={30} color="#6A5ACD" />
      <ActivityIndicator size="large" color="#6A5ACD" style={{ marginVertical: 10 }} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  text: {
    marginTop: 10,
    color: '#6A5ACD',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ChartLoader;

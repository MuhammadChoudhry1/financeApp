import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChartCard = ({ title, children, fallback }) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    {children ? children : <Text style={styles.fallback}>{fallback || 'No data available'}</Text>}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  fallback: {
    marginTop: 10,
    color: '#999',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default ChartCard;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const ForecastCard = ({ forecast, onRefresh, loading, error }) => (
  <View style={styles.card}>
    <Text style={styles.title}>Next Month Forecast</Text>
    <Text style={styles.subtitle}>Predicted summary for the upcoming month</Text>

    {loading ? (
      <ActivityIndicator size="large" color="#6A5ACD" />
    ) : error ? (
      <Text style={styles.error}>{error}</Text>
    ) : forecast ? (
      <View style={styles.forecastContainer}>
        <Text style={styles.message}>{forecast.message}</Text>
        <Text style={styles.details}>Income: £{forecast.details.income}</Text>
        <Text style={styles.details}>Expense: £{forecast.details.expense}</Text>
        <Text style={styles.details}>Savings: £{forecast.details.savings}</Text>
      </View>
    ) : (
      <Text style={styles.placeholder}>No forecast data available</Text>
    )}

    <TouchableOpacity onPress={onRefresh}>
      <Text style={styles.refreshText}>Refresh Forecast</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  forecastContainer: {
    backgroundColor: '#f0f0ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6A5ACD',
    marginBottom: 8,
  },
  details: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginVertical: 10,
  },
  refreshText: {
    color: '#6A5ACD',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  error: {
    color: '#E53935',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ForecastCard;

import React, { useEffect, useState } from 'react';
import { SafeAreaView, FlatList, Text, Button, StyleSheet, View, ActivityIndicator } from 'react-native';
import axios from 'axios';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true); // Control for pagination

  const API_URL = 'http://127.0.0.1:5000/api/v1.0/expenses';  // Backend API

  const fetchExpenses = async (page) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}?pn=${page}&ps=10`);
      const data = response.data;

      if (data.length > 0) {
        setExpenses(data);
        setHasMoreData(true);
      } else {
        setHasMoreData(false); // No more data to load
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(pageNum);
  }, [pageNum]);

  const handleNext = () => {
    if (hasMoreData) {
      setPageNum(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (pageNum > 1) {
      setPageNum(prev => prev - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Expenses (Page {pageNum})</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.expenseText}>ID: {item._id}</Text>
              <Text style={styles.expenseText}>Amount: ${item.amount}</Text>
              <Text style={styles.expenseText}>Category: {item.category}</Text>
            </View>
          )}
        />
      )}

      <View style={styles.pagination}>
        <Button title="Previous" onPress={handlePrevious} disabled={pageNum === 1 || isLoading} />
        <Button title="Next" onPress={handleNext} disabled={!hasMoreData || isLoading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  item: { padding: 15, marginVertical: 8, backgroundColor: '#f9f9f9', borderRadius: 8 },
  expenseText: { fontSize: 16 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }
});

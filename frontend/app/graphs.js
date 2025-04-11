import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import Navigation2 from './components/Navagation/Navagation2'; // Ensure Navigation2 is imported
import HeaderMenu from './components/Common/HeaderMenu'; // Ensure HeaderMenu is imported
import ChartCard from './components/Charts/ChartCard'; // Import ChartCard
import ForecastCard from './components/Charts/ForecastCard'; // Import ForecastCard
import ChartLoader from './components/Charts/ChartLoader'; // Import ChartLoader

const { width } = Dimensions.get('window');
const chartWidth = width * 0.9;
const chartHeight = 280;

const Graphs = () => {
    const [expenses, setExpenses] = useState([]);
    const [expenseSummary, setExpenseSummary] = useState([]);
    const [monthlySummary, setMonthlySummary] = useState([]);
    const [monthlyByCategory, setMonthlyByCategory] = useState({ labels: [], datasets: [] });
    const [activeChart, setActiveChart] = useState('pie'); 
    const [loading, setLoading] = useState(true);
    const [forecast, setForecast] = useState(null);
    const [error, setError] = useState(null);

    const fetchForecast = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await AsyncStorage.getItem('token'); 
            if (!token) {
                setError('Authentication token is missing. Please log in again.');
                return;
            }

            const headers = { 'x-access-token': token };
            const response = await axios.get('http://192.168.1.214:5000/api/v1.0/predict-next-month', { headers }); 

            if (response.status === 200 && response.data) {
                setForecast(response.data);
            } else {
                setError('Unexpected response from the server. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching forecast:', err);
            setError('Failed to fetch forecast data. Please check your connection or try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await fetchForecast(); 
            await fetchExpenses(); 
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (monthlyByCategory.length > 0) {
            calculateMonthlyByCategory();
        }
    }, [monthlyByCategory]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token'); 
            const headers = { 'x-access-token': token };

            const response = await axios.get('http://192.168.1.214:5000/api/v1.0/expenses/summary', { headers }); 
            const summaryData = Object.entries(response.data).map(([category, amount], index) => ({
                name: category,
                amount: parseFloat(amount),
                color: colorPalette[index % colorPalette.length],
                legendFontColor: '#555',
                legendFontSize: 12,
            }));
            setExpenseSummary(summaryData);

            const monthlyResponse = await axios.get('http://192.168.1.214:5000/api/v1.0/expenses/monthly', { headers }); 
            const monthlyData = monthlyResponse.data.map(item => ({
                month: item.month,
                amount: parseFloat(item.amount),
            }));
            setMonthlySummary(monthlyData);

            const monthlyCategoryResponse = await axios.get('http://192.168.1.214:5000/api/v1.0/expenses/monthly-category', { headers }); 
            setMonthlyByCategory(monthlyCategoryResponse.data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const colorPalette = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#8AC24A', '#FF5722',
        '#607D8B', '#9C27B0', '#00BCD4', '#9CCC65',
        '#AB47BC', '#6A5ACD', '#E91E63', '#3F51B5'
    ];

    const calculateExpenseSummary = () => {
        const summary = {};
        expenses.forEach(exp => {
            if (!summary[exp.category]) summary[exp.category] = 0;
            summary[exp.category] += parseFloat(exp.amount);
        });

        const data = Object.keys(summary)
            .sort((a, b) => a.localeCompare(b)) 
            .map((key, index) => ({
                name: key,
                amount: summary[key],
                color: colorPalette[index % colorPalette.length],
                legendFontColor: '#555',
                legendFontSize: 12,
            }));

        setExpenseSummary(data);
    };

    const calculateMonthlySummary = () => {
        const monthlyData = {};
        expenses.forEach(exp => {
            const [year, month] = exp.date.split('-');
            const key = `${year}-${month.padStart(2, '0')}`;
            if (!monthlyData[key]) monthlyData[key] = 0;
            monthlyData[key] += parseFloat(exp.amount);
        });

        const sorted = Object.keys(monthlyData)
            .map(month => ({ month, amount: monthlyData[month] }))
            .sort((a, b) => new Date(a.month) - new Date(b.month)) 
            .slice(-6); 

        setMonthlySummary(sorted);
    };

    const calculateMonthlyByCategory = () => {
        const dataMap = {};
        monthlyByCategory.forEach(exp => {
            const { month, category, total } = exp;
            if (!dataMap[category]) dataMap[category] = {};
            dataMap[category][month] = total;
        });

        const allMonths = [...new Set(monthlyByCategory.map(e => e.month))]
            .sort((a, b) => new Date(a) - new Date(b)); 
        const last6Months = allMonths.slice(-6);

        const datasets = Object.keys(dataMap)
            .sort((a, b) => a.localeCompare(b)) 
            .map(category => ({
                data: last6Months.map(month => dataMap[category][month] || 0),
                color: () => colorPalette[Object.keys(dataMap).indexOf(category) % colorPalette.length],
                label: category
            }))
            .filter(dataset => dataset.data.some(val => val > 0)); 

        setMonthlyByCategory({ 
            labels: last6Months,
            datasets: datasets.slice(0, 5) 
        });
    };

    const formatMonthLabel = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'short' });
    };

    const refreshData = () => {
        fetchExpenses();
    };

    if (loading) {
        return <ChartLoader message="Loading data..." />; // Replace loading UI with ChartLoader
    }

    return (
        <SafeAreaView style={styles.container}>
            <HeaderMenu /> {/* Add HeaderMenu at the top */}

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Expense Analytics</Text>
                    <TouchableOpacity onPress={refreshData} style={styles.refreshButton}>
                        <MaterialIcons name="refresh" size={24} color="#6A5ACD" />
                    </TouchableOpacity>
                </View>

                <Navigation2 /> {/* Add Navigation2 component */}

                <View style={{ flex: 45 }}>

                    {/* Pie Chart */}
                    <ChartCard title="Spending by Category" fallback="No expense data available">
                        {expenseSummary.length > 0 && (
                            <PieChart
                                data={expenseSummary}
                                width={chartWidth}
                                height={chartHeight}
                                chartConfig={{
                                    backgroundColor: '#ffffff',
                                    backgroundGradientFrom: '#f8f9fa',
                                    backgroundGradientTo: '#f8f9fa',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                                accessor="amount"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                            />
                        )}
                    </ChartCard>

                    {/* Line Chart */}
                    <ChartCard title="Monthly Spending Trend" fallback="No monthly data available">
                        {monthlySummary.length > 0 && (
                            <LineChart
                                data={{
                                    labels: monthlySummary.map(item => formatMonthLabel(item.month)),
                                    datasets: [{ data: monthlySummary.map(item => item.amount) }],
                                }}
                                width={chartWidth}
                                height={chartHeight}
                                chartConfig={{
                                    backgroundColor: '#ffffff',
                                    backgroundGradientFrom: '#f8f9fa',
                                    backgroundGradientTo: '#f8f9fa',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(106, 90, 205, ${opacity})`,
                                }}
                                bezier
                            />
                        )}
                    </ChartCard>

                    {/* Bar Chart */}
                    <ChartCard title="Monthly by Category" fallback="No category data available">
                        {monthlyByCategory?.datasets?.length > 0 && (
                            <BarChart
                                data={{
                                    labels: monthlyByCategory.labels.map(label => formatMonthLabel(label)),
                                    datasets: monthlyByCategory.datasets,
                                }}
                                width={chartWidth}
                                height={chartHeight}
                                chartConfig={{
                                    backgroundColor: '#ffffff',
                                    backgroundGradientFrom: '#f8f9fa',
                                    backgroundGradientTo: '#f8f9fa',
                                    decimalPlaces: 0,
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                            />
                        )}
                    </ChartCard>

                    {/* Forecast Card */}
                    <ForecastCard
                        forecast={forecast}
                        onRefresh={fetchForecast}
                        loading={loading}
                        error={error}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#white',
  },
  contentContainer: {
    paddingBottom: 40,
    paddingHorizontal: 10,
  },
  header: {
    paddingTop: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  refreshButton: {
    position: 'absolute',
    right: 20,
    top: 15,
    padding: 6,
    backgroundColor: '#e8eaf6',
    borderRadius: 20,
  },
});

export default Graphs;
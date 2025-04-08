import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { PieChart, LineChart, BarChart } from 'react-native-chart-kit';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const chartWidth = width * 0.9;
const chartHeight = 280;

const Graphs = () => {
    const [expenses, setExpenses] = useState([]);
    const [expenseSummary, setExpenseSummary] = useState([]);
    const [monthlySummary, setMonthlySummary] = useState([]);
    const [monthlyByCategory, setMonthlyByCategory] = useState({ labels: [], datasets: [] });
    const [activeChart, setActiveChart] = useState('pie'); // 'pie', 'line', 'bar'
    const [loading, setLoading] = useState(true);
    const [forecast, setForecast] = useState(null);
    const [error, setError] = useState(null);

    const fetchForecast = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token is missing. Please log in again.');
                return;
            }

            const headers = { 'x-access-token': token };
            const response = await axios.get('http://localhost:5000/api/v1.0/predict-next-month', { headers });

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
            await fetchForecast(); // Fetch forecast data
            await fetchExpenses(); // Fetch expenses data
        };
        fetchData();
    }, []); // Ensure both forecast and expenses are fetched on mount

    useEffect(() => {
        if (monthlyByCategory.length > 0) {
            calculateMonthlyByCategory();
        }
    }, [monthlyByCategory]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
            const headers = { 'x-access-token': token };

            const response = await axios.get('http://localhost:5000/api/v1.0/expenses/summary', { headers });
            const summaryData = Object.entries(response.data).map(([category, amount], index) => ({
                name: category,
                amount: parseFloat(amount),
                color: colorPalette[index % colorPalette.length],
                legendFontColor: '#555',
                legendFontSize: 12,
            }));
            setExpenseSummary(summaryData);

            const monthlyResponse = await axios.get('http://localhost:5000/api/v1.0/expenses/monthly', { headers });
            const monthlyData = monthlyResponse.data.map(item => ({
                month: item.month,
                amount: parseFloat(item.amount),
            }));
            setMonthlySummary(monthlyData);

            const monthlyCategoryResponse = await axios.get('http://localhost:5000/api/v1.0/expenses/monthly-category', { headers });
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
            .sort((a, b) => a.localeCompare(b)) // Sort categories alphabetically
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
            .sort((a, b) => new Date(a.month) - new Date(b.month)) // Sort months chronologically
            .slice(-6); // Show last 6 months

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
            .sort((a, b) => new Date(a) - new Date(b)); // Sort months chronologically
        const last6Months = allMonths.slice(-6);

        const datasets = Object.keys(dataMap)
            .sort((a, b) => a.localeCompare(b)) // Sort categories alphabetically
            .map(category => ({
                data: last6Months.map(month => dataMap[category][month] || 0),
                color: () => colorPalette[Object.keys(dataMap).indexOf(category) % colorPalette.length],
                label: category
            }))
            .filter(dataset => dataset.data.some(val => val > 0)); // Only show categories with data

        setMonthlyByCategory({ 
            labels: last6Months,
            datasets: datasets.slice(0, 5) // Limit to 5 categories for better readability
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
        return (
            <View style={styles.loadingContainer}>
                <MaterialIcons name="refresh" size={24} color="#6A5ACD" />
                <Text style={styles.loadingText}>Loading data...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Expense Analytics</Text>
                <TouchableOpacity onPress={refreshData} style={styles.refreshButton}>
                    <MaterialIcons name="refresh" size={24} color="#6A5ACD" />
                </TouchableOpacity>
            </View>

            <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.navBarContainer}
        contentContainerStyle={styles.navBarContent}
      >
        <TouchableOpacity style={styles.navBarItem} onPress={() => navigation.navigate('expensetracking')}>
          <Text style={styles.navBarText}>Expense Tracking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBarItem} onPress={() => navigation.navigate('incomeDocumentation')}>
          <Text style={styles.navBarText}>Income Documentation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBarItem} onPress={() => navigation.navigate('saving_goals')}>
          <Text style={styles.navBarText}>Saving Goals</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBarItem} onPress={() => navigation.navigate('graphs')}>
          <Text style={styles.navBarText}>Reporting Analytics</Text>
        </TouchableOpacity>
      </ScrollView>

<View style={{flex:45}}>

            {/* Pie Chart */}
            <View style={styles.chartWrapper}>
                <Text style={styles.chartTitle}>Spending by Category</Text>
                <Text style={styles.chartDescription}>Breakdown of your expenses by category</Text>
                {expenseSummary.length > 0 ? (
                    <View style={styles.responsiveChartContainer}>
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
                            hasLegend={true}
                            style={{
                                borderRadius: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 6,
                                elevation: 3,
                                width: '100%',
                                height: '100%',
                            }}
                        />
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="pie-chart" size={40} color="#ccc" />
                        <Text style={styles.emptyText}>No expense data available</Text>
                    </View>
                )}
            </View>

            {/* Line Chart */}
            <View style={styles.chartWrapper}>
                <Text style={styles.chartTitle}>Monthly Spending Trend</Text>
                <Text style={styles.chartDescription}>Your spending over the last 6 months</Text>
                {monthlySummary.length > 0 ? (
                    <View style={styles.responsiveChartContainer}>
                        <LineChart
                            data={{
                                labels: monthlySummary.map(item => formatMonthLabel(item.month)),
                                datasets: [{
                                    data: monthlySummary.map(item => item.amount),
                                    color: () => '#6A5ACD',
                                    strokeWidth: 3
                                }]
                            }}
                            width={chartWidth}
                            height={chartHeight}
                            yAxisLabel="$"
                            yAxisSuffix=""
                            yAxisInterval={1}
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#f8f9fa',
                                backgroundGradientTo: '#f8f9fa',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(106, 90, 205, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                propsForDots: {
                                    r: '5',
                                    strokeWidth: '2',
                                    stroke: '#6A5ACD',
                                },
                                propsForLabels: {
                                    fontSize: 10
                                }
                            }}
                            bezier
                            style={{
                                borderRadius: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 6,
                                elevation: 3,
                            }}
                        />
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="show-chart" size={40} color="#ccc" />
                        <Text style={styles.emptyText}>No monthly data available</Text>
                    </View>
                )}
            </View>

            {/* Bar Chart */}
            <View style={styles.chartWrapper}>
                <Text style={styles.chartTitle}>Monthly by Category</Text>
                <Text style={styles.chartDescription}>Monthly spending by category</Text>
                {monthlyByCategory?.datasets?.length > 0 ? (
                    <View style={styles.responsiveChartContainer}>
                        <BarChart
                            data={{
                                labels: monthlyByCategory.labels.map(label => formatMonthLabel(label)),
                                datasets: monthlyByCategory.datasets
                            }}
                            width={chartWidth}
                            height={chartHeight}
                            yAxisLabel="$"
                            yAxisSuffix=""
                            fromZero
                            showBarTops={false}
                            chartConfig={{
                                backgroundColor: '#ffffff',
                                backgroundGradientFrom: '#f8f9fa',
                                backgroundGradientTo: '#f8f9fa',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                barPercentage: 0.7,
                                propsForLabels: {
                                    fontSize: 10
                                }
                            }}
                            style={{
                                borderRadius: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 6,
                                elevation: 3,
                            }}
                        />
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="bar-chart" size={40} color="#ccc" />
                        <Text style={styles.emptyText}>No category data available</Text>
                    </View>
                )}
            </View>
            <View style={styles.chartWrapper}>
                <Text style={styles.chartTitle}>Next Month Forecast</Text>
                <Text style={styles.chartDescription}>Predicted summary for the upcoming month</Text>
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
                <TouchableOpacity onPress={fetchForecast} style={styles.refreshButton}>
                    <Text style={styles.refreshText}>Refresh Forecast</Text>
                </TouchableOpacity>
            </View>
        </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f6f8', // Softer background color
        paddingTop: 20,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f6f8',
    },
    loadingText: {
        marginTop: 10,
        color: '#6A5ACD',
        fontSize: 16,
        fontWeight: '500',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 26, // Slightly larger font
        fontWeight: 'bold',
        color: '#333',
    },
    refreshButton: {
        padding: 8,
        backgroundColor: '#e8eaf6', // Subtle background for button
        borderRadius: 8,
    },
    navContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 15,
    },
    navButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    purpleButton: {
        backgroundColor: '#6A5ACD',
    },
    navText: {
        color: '#fff',
        fontWeight: '600',
    },
    chartWrapper: {
        width: width - 20,
        marginHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20, // Increased padding for better spacing
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 20,
    },
    responsiveChartContainer: {
        width: '100%',
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 20, // Larger font for titles
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    chartDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        textAlign: 'center',
    },
    emptyState: {
        height: chartHeight - 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 10,
        color: '#999',
        fontSize: 16,
        fontStyle: 'italic',
    },
    forecastContainer: {
        backgroundColor: '#f0f0ff', // Light purple to match chart cards
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    message: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6A5ACD', // Match theme color
        marginBottom: 10,
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
    },
    navBarContainer: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingTop: 10,
      },
      navBarContent: {
        flexDirection: 'row',
        paddingHorizontal: 10,
      },
      navBarItem: {
        backgroundColor: '#6A5ACD',
        height: 50,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
      },
      navBarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
      },
});

export default Graphs;
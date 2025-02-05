import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Platform, SafeAreaView, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const HomePage = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.topBackground}>
                    <View style={styles.headerContainer}>
                        <TouchableOpacity style={styles.logoContainer}>
                            <Image source={require('../assets/images/logo.png')} style={styles.logo} />
                        </TouchableOpacity>
                        <View style={styles.balanceContainer}>
                            <Text style={styles.balanceText}>Account Balance</Text>
                            <Text style={styles.balanceAmount}>$1234.56</Text>
                        </View>
                    </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navBarContainer} contentContainerStyle={styles.navBarContent}>
                    <TouchableOpacity style={[styles.navBarItem, styles.navBarItemShadow]} onPress={() => navigation.navigate('expense-tracking')}>
                        <Text style={styles.navBarText}>Expense Tracking</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navBarItem, styles.navBarItemShadow]} onPress={() => navigation.navigate('incomeDoc')}>
                        <Text style={styles.navBarText}>Income Documentation</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navBarItem, styles.navBarItemShadow]} onPress={() => navigation.navigate('saving-goals')}>
                        <Text style={styles.navBarText}>Saving Goals</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navBarItem, styles.navBarItemShadow]} onPress={() => navigation.navigate('reporting-analytics')}>
                        <Text style={styles.navBarText}>Reporting Analytics</Text>
                    </TouchableOpacity>
                </ScrollView>
                <ScrollView contentContainerStyle={styles.expenseListContent}>
                    {/* Remove the sample expense */}
                </ScrollView>
                <Modal
                    visible={false}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.popupOverlay}>
                        <View style={styles.logoutPopupContainer}>
                            <Text style={styles.logoutText}>Are you sure you want to logout?</Text>
                            <View style={styles.logoutButtons}>
                                <TouchableOpacity style={styles.confirmLogoutButton}>
                                    <Text style={styles.confirmLogoutButtonText}>Yes</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelLogoutButton}>
                                    <Text style={styles.cancelLogoutButtonText}>No</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Platform.OS === 'android' ? '#fff' : '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topBackground: {
        width: '100%',
        height: '40%',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#6A5ACD',
        elevation: 5,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#f0f0f0',
        elevation: 3,
    },
    balanceContainer: {
        flex: 1,
        marginLeft: 10,
    },
    balanceText: {
        fontSize: 22,
        color: '#fff',
        fontWeight: 'bold',
    },
    balanceAmount: {
        fontSize: 38,
        fontWeight: 'bold',
        color: '#fff',
    },
    navBarContainer: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingBottom: 0,
        marginBottom: 0,
    },
    navBarContent: {
        flexDirection: 'row',
        paddingHorizontal: 10,
    },
    navBarItem: {
        backgroundColor: '#fff',
        height: 55,
        paddingHorizontal: 25,
        borderRadius: 15,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    navBarItemShadow: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    navBarText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    expenseListContent: {
        flexGrow: 1,
        alignItems: 'center',
        padding: 10,
    },
    expenseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginVertical: 8,
        width: '100%',
    },
    expenseDescription: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    expenseAmount: {
        fontSize: 16,
        color: '#6A5ACD',
        fontWeight: 'bold',
    },
    expenseCategory: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
    },
    floatingButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#6A5ACD',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    floatingButtonText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    popupOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    popupContainer: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 10,
    },
    closeButton: {
        marginTop: 10,
        backgroundColor: '#FF6347',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutPopupContainer: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 10,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    logoutButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    confirmLogoutButton: {
        backgroundColor: '#FF6347',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 10,
        flex: 1,
        minWidth: 100,
    },
    confirmLogoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelLogoutButton: {
        backgroundColor: '#6A5ACD',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        flex: 1,
        minWidth: 100,
    },
    cancelLogoutButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default HomePage;

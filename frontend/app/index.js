import React from 'react';
import { View, StyleSheet, Dimensions, Platform, SafeAreaView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import AppLogo from './components/Common/AppLogo';
import PrimaryButton from './components/Common/PrimaryButton';

const { width, height } = Dimensions.get('window');

const IndexPage = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#6A5ACD', '#836FFF', '#48D1CC']} style={styles.background}>
        <View style={styles.overlay}>
          <AppLogo />
          <PrimaryButton title="Log In" onPress={() => navigation.navigate('login')} />
          <PrimaryButton title="Create Account" onPress={() => navigation.navigate('create_account')} />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Platform.OS === 'android' ? '#000' : 'transparent',
  },
  background: {
    flex: 1,
    width: width,
    height: height,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default IndexPage;

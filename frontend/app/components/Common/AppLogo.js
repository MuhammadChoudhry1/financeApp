// components/Common/AppLogo.js
import React from 'react';
import { Image, StyleSheet } from 'react-native';
const AppLogo = ({ size = 120 }) => (
  <Image
    source={require('../../assets/images/logo.png')}
    style={[styles.logo, { width: size, height: size, borderRadius: size / 2 }]}
  />
);

const styles = StyleSheet.create({
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
    borderRadius: 60,
  },
});

export default AppLogo;

import React, { useEffect } from 'react';
import { View, Text, Image,  StyleSheet } from 'react-native';


const splashImg = require ("../assets/blood drop.png")

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    
    setTimeout(() => {
      // Navigate to the login screen
      navigation.navigate('Login');
    }, 2000); // 2000 milliseconds delay
  }, [navigation]);

  return (
    <View style={styles.container}>
    <Image
      source={splashImg} // Replace with the path to your exciting image
      style={styles.image}
    />
    <Text style = {styles.Text}>Opti-Gluco</Text>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Text : {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 40,
  },
  image: {
    width: 200, // Adjust according to your image size
    height: 200, // Adjust according to your image size
    resizeMode: 'contain',
  },
});

export default SplashScreen;
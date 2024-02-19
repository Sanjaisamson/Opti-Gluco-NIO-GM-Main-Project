import React, { useState } from 'react';
import { View, TextInput, StyleSheet, ImageBackground } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {signInWithEmailAndPassword} from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import {auth} from './firebase';
import { Text, Button } from 'react-native-paper';

// const bgimage = require ('../assets/bgimage.jpg');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [text, onChangeText] = React.useState('Useless Text');
  const [number, onChangeNumber] = React.useState('');
  const [registrationStatus , setRegistrationStatus] = useState('');
  const navigation = useNavigation(); 


  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', userCredential.user.email);
      setRegistrationStatus('login successfully');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error logging in user:', error);
    }
  };

  return (
    
    <View style={styles.container}>
      <View>
      <Text style={styles.title} variant="displayMedium" >Login</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        clearTextOnFocus = {true}
        value={email}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
        clearTextOnFocus = {true}
        value={password}
        secureTextEntry
      />
      <View style = {styles.fixToText} >
      <Button style = {styles.button} icon="login" mode="elevated" title="Login" onPress={handleLogin}>Login</Button>
      {registrationStatus === 'Success' && <Text style={styles.successMessage}>Registration Successful!</Text>}
      {registrationStatus === 'Error' && <Text style={styles.errorMessage}>Registration Failed. Please try again.</Text>}
      </View>

      <View style = {styles.footer}>
        <Text>Create an account</Text>
      <Button icon="login" mode="text" title="Register" onPress={handleRegister} >sign up</Button>
      </View>
    </View>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    width : 200,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button:{
    alignItems:'center',
    borderBlockColor: 'blue'
  },
  successMessage: {
    color: 'green',
    marginTop: 10,
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
  },
  footer: {
    margin: 12,
    padding: 60,
  }
});

export default LoginScreen
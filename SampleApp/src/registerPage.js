import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import {auth} from './firebase';
import { Text, Button } from 'react-native-paper';
import {createUserWithEmailAndPassword } from "firebase/auth";
const RegisterScreen = () => {
    // const [productId, setProductId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [registrationStatus , setRegistrationStatus] = useState('');
  
    const handleRegister = async () => {
      try {
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User registered successfully:', userCredential.user.email);
        setRegistrationStatus('Success');

      } catch (error) {
        console.error('Error registering user:', error);
        setRegistrationStatus('Error')
      }
    };
  
    return (
      <View style={styles.container}>
        <View>
      <Text style={styles.title} >Create new Account</Text>
      </View>
        {/* <TextInput
          style={styles.input}
          placeholder="Product ID"
          onChangeText={setProductId}
          value={productId}
        /> */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
        />
        <View style = {styles.button}>
        <Button icon="login" mode="elevated" title="Register" onPress={handleRegister}>Register</Button>
        {registrationStatus === 'Success' && <Text style={styles.successMessage}>Registration Successful!</Text>}
        {registrationStatus === 'Error' && <Text style={styles.errorMessage}>Registration Failed. Please try again.</Text>}
        </View>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 50,
    },
    input: {
      width: '80%',
      marginBottom: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
    },
    successMessage: {
        color: 'green',
        marginTop: 10,
      },
      errorMessage: {
        color: 'red',
        marginTop: 10,
      },
      button: {
        padding:'30'
      }
  });
  
  export default RegisterScreen;
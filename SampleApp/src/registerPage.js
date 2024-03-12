import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { Constants } from "../src/constants/env";
import axios from "axios";

const RegisterScreen = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState("");
  const navigation = useNavigation();

  const handleRegister = async () => {
    try {
      const requestData = JSON.stringify({
        userName: userName,
        mailId: email,
        password: password,
      });

      const response = await axios.post(
        `http://${Constants.localhost}:${Constants.port}/api/signup`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setRegistrationStatus("Success");
        navigation.navigate("Login");
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      setRegistrationStatus("Error");
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Create new Account</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="User Name"
        onChangeText={setUserName}
        value={userName}
      />
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
      <View style={styles.button}>
        <Button
          icon="login"
          mode="elevated"
          title="Register"
          onPress={handleRegister}
        >
          Register
        </Button>
        {registrationStatus === "Success" && (
          <Text style={styles.successMessage}>Registration Successful!</Text>
        )}
        {registrationStatus === "Error" && (
          <Text style={styles.errorMessage}>
            Registration Failed. Please try again.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 50,
  },
  input: {
    width: "80%",
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  successMessage: {
    color: "green",
    marginTop: 10,
  },
  errorMessage: {
    color: "red",
    marginTop: 10,
  },
  button: {
    padding: "30",
  },
});

export default RegisterScreen;

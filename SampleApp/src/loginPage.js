import React, { useState } from "react";
import { View, TextInput, StyleSheet, Vibration } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Text, Button } from "react-native-paper";
import constants from "./constants/appConstants";
import axios from "axios";
import "core-js/stable/atob";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const navigation = useNavigation();

  const handleRegister = () => {
    navigation.navigate(constants.PATH_CONSTANTS.REGISTER);
  };

  const handleLogin = async () => {
    try {
      const requestData = JSON.stringify({
        mailId: email,
        password: password,
      });
      const response = await axios.post(
        `http://${constants.SERVER_CONSTANTS.localhost}:${constants.SERVER_CONSTANTS.port}/api/login`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === constants.RESPONSE_STATUS.SUCCESS) {
        setLoginStatus(constants.STATUS_CONSTANTS.COMPLETED);
        const responseData = response.data;
        await AsyncStorage.setItem(
          constants.STORAGE_CONSTANTS.ACCESS_TOKEN,
          responseData.accessToken
        );
        navigation.navigate(constants.PATH_CONSTANTS.HOME, {
          userId: responseData.loginResponse.user_id,
          userName: responseData.loginResponse.user_name,
        });
      } else {
        throw new Error(constants.RESPONSE_STATUS.FAILED);
      }
    } catch (error) {
      setLoginStatus(constants.STATUS_CONSTANTS.FAILED);
      Vibration.vibrate(1000);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title} variant="displayMedium">
          Login
        </Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        clearTextOnFocus={true}
        value={email}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
        clearTextOnFocus={true}
        value={password}
        secureTextEntry
      />
      <View style={styles.fixToText}>
        <Button
          style={styles.button}
          icon="login"
          mode="elevated"
          title="Login"
          onPress={handleLogin}
        >
          Login
        </Button>
      </View>
      <View>
        {loginStatus === constants.STATUS_CONSTANTS.COMPLETED && (
          <Text style={styles.successMessage}>Login Successful!</Text>
        )}
        {loginStatus === constants.STATUS_CONSTANTS.FAILED && (
          <Text style={styles.errorMessage}>
            Login Failed. Please try again.
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text>Create an account</Text>
        <Button
          icon="login"
          mode="text"
          title="Register"
          onPress={handleRegister}
        >
          sign up
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 40,
    width: 200,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  fixToText: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    alignItems: "center",
    borderBlockColor: "blue",
  },
  successMessage: {
    color: "green",
    marginTop: 10,
  },
  errorMessage: {
    color: "red",
    marginTop: 10,
  },
  footer: {
    margin: 12,
    padding: 60,
  },
});

export default LoginScreen;

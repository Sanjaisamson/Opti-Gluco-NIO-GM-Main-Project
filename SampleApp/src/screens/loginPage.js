import React, { useState } from "react";
import "core-js/stable/atob";
import axios from "axios";
import { View, StyleSheet, Vibration, StatusBar, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Text, Button, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CONSTANTS from "../constants/appConstants";

const logo = require("../../assets/opti-gluco-high-resolution-logo-white-transparent.png"); // C:\Users\SANJAI\OneDrive\Documents\Main_Project\SampleApp\assets\opti-gluco-high-resolution-logo-white-transparent.png

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const navigation = useNavigation();

  const handleRegister = () => {
    navigation.navigate(CONSTANTS.PATH_CONSTANTS.REGISTER);
  };

  const handleLogin = async () => {
    try {
      const requestData = JSON.stringify({
        mailId: email,
        password: password,
      });
      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/api/login`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        setLoginStatus(CONSTANTS.STATUS_CONSTANTS.COMPLETED);
        const responseData = response.data;
        console.log(responseData);
        await AsyncStorage.setItem(
          CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN,
          responseData.accessToken
        );
        await AsyncStorage.setItem(
          CONSTANTS.STORAGE_CONSTANTS.USER_NAME,
          responseData.userName
        );
        // await AsyncStorage.setItem(
        //   CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN,
        //   responseData.accessToken
        // );
        navigation.navigate(CONSTANTS.PATH_CONSTANTS.HOME);
      } else {
        throw new Error(CONSTANTS.RESPONSE_STATUS.FAILED);
      }
    } catch (error) {
      console.log("error", error);
      setLoginStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
      Vibration.vibrate(1000);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Image
          source={logo} // Replace with the path to your exciting image
          style={styles.image}
        />
      </View>
      <View>
        <Text style={styles.title} variant="displayMedium">
          Are you ready to Check?
        </Text>
      </View>
      <TextInput
        style={styles.input}
        placeholderTextColor={"#8c8c8c"}
        placeholder="Email"
        textColor="white"
        cursorColor="white"
        onChangeText={setEmail}
        clearTextOnFocus={true}
        value={email}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholderTextColor={"#8c8c8c"}
        placeholder="Password"
        cursorColor="white"
        textColor="white"
        onChangeText={setPassword}
        clearTextOnFocus={true}
        value={password}
        secureTextEntry
      />
      <Text style={{ fontSize: 10, color: "#f2f4f7" }} variant="displayMedium">
        By continuing, you agree to the T&C and Privacy policy
      </Text>
      <View style={styles.fixToText}>
        <Button style={styles.button} title="Login" onPress={handleLogin}>
          <Text
            style={{
              fontSize: 20,
              color: "#f2f4f7",
              fontWeight: "bold",
            }}
          >
            Login
          </Text>
        </Button>
      </View>
      <View>
        {loginStatus === CONSTANTS.STATUS_CONSTANTS.COMPLETED && (
          <Text style={styles.successMessage}>Login Successful!</Text>
        )}
        {loginStatus === CONSTANTS.STATUS_CONSTANTS.FAILED && (
          <Text style={styles.errorMessage}>
            Login Failed. Please try again.
          </Text>
        )}
      </View>
      <View>
        <Text
          style={{
            margin: 20,
            fontSize: 10,
            color: "#e6e6e6",
          }}
        >
          ------------------------------------------------------
          <Text
            style={{
              fontSize: 20,
              color: "#f2f4f7",
              fontWeight: "bold",
            }}
          >
            OR
          </Text>
          ------------------------------------------------------
        </Text>
      </View>
      <View>
        <Button mode="text" title="Register" onPress={handleRegister}>
          <Text
            style={{
              fontSize: 20,
              color: "#a6a6a6",
              fontWeight: "bold",
              marginBottom: 50,
            }}
          >
            Create a new account
          </Text>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#000103",
  },
  input: {
    height: 40,
    width: 300,
    borderColor: "#f2f4f7",
    borderWidth: 1,
    backgroundColor: "#000103",
    borderBlockColor: "#f2f4f7",
  },
  fixToText: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 0,
    width: "80%",
    height: 50,
    color: "#841584",
    borderRadius: 10,
    backgroundColor: "#ff0000",
    justifyContent: "center",
  },
  successMessage: {
    color: "green",
    marginTop: 10,
  },
  errorMessage: {
    color: "red",
    marginTop: 10,
  },
  title: {
    fontSize: 30,
    marginTop: 0,
    margin: 30,
    padding: "auto",
    fontWeight: "bold",
    justifyContent: "center",
    color: "#f2f4f7",
  },
  image: {
    width: 200,
    height: 100, // Adjust according to your image size
    resizeMode: "contain",
  },
});
export default LoginScreen;

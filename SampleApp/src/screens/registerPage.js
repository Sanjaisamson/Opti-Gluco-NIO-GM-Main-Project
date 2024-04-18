import React, { useState } from "react";
import axios from "axios";
import {
  View,
  TextInput,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
} from "react-native";
import { Text, Button, Avatar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import CONSTANTS from "../constants/appConstants";

const logo = require("../../assets/opti-gluco-high-resolution-logo-white-transparent.png");
const logoIcon = require("../../assets/opti-gluco-favicon-white.png");
const avatarIcon = require("../../assets/avatar icon .jpg");

const RegisterScreen = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState("");
  const navigation = useNavigation();

  const handleRegister = async () => {
    try {
      const requestData = JSON.stringify({
        userName: userName,
        mailId: email,
        password: password,
        age: age,
        gender: gender,
      });

      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/api/signup`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setRegistrationStatus(CONSTANTS.STATUS_CONSTANTS.COMPLETED);
        navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
      } else {
        throw new Error(404);
      }
    } catch (error) {
      setRegistrationStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          margin: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#000103",
        }}
      >
        <View>
          <Image
            source={logo} // Replace with the path to your exciting image
            style={{
              width: 200,
              height: 50,
              resizeMode: "contain",
            }}
          />
        </View>
        <View>
          <Avatar.Image size={30} source={avatarIcon} />
        </View>
      </View>
      <View
        style={{
          marginTop: 10,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#000103",
        }}
      >
        <View
          style={{
            margin: 50,
          }}
        >
          <Text style={styles.title}>Create new Account</Text>
        </View>
        <View>
          <View>
            <TextInput
              style={styles.input}
              placeholder="User Name"
              placeholderTextColor={"#8c8c8c"}
              textColor="white"
              onChangeText={setUserName}
              value={userName}
              clearTextOnFocus={true}
              autoCapitalize="none"
            />
          </View>
          <View>
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
          </View>
          <View>
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
          </View>
          <View>
            <TextInput
              style={styles.input}
              placeholderTextColor={"#8c8c8c"}
              placeholder="Your Age..."
              cursorColor="white"
              textColor="white"
              onChangeText={setAge}
              clearTextOnFocus={true}
              value={age}
              secureTextEntry
            />
          </View>
          <View>
            <TextInput
              style={styles.input}
              placeholderTextColor={"#8c8c8c"}
              placeholder="your gender..."
              cursorColor="white"
              textColor="white"
              onChangeText={setGender}
              clearTextOnFocus={true}
              value={gender}
              secureTextEntry
            />
          </View>
        </View>
        <View>
          <TouchableOpacity
            style={{
              borderRadius: 5,
              width: 200,
              height: 40,
              backgroundColor: "red", // grey shade
              justifyContent: "center",
            }}
            onPress={handleRegister}
          >
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Register
            </Text>
          </TouchableOpacity>
          {registrationStatus === CONSTANTS.STATUS_CONSTANTS.COMPLETED && (
            <Text style={styles.successMessage}>Registration Successful!</Text>
          )}
          {registrationStatus === CONSTANTS.STATUS_CONSTANTS.FAILED && (
            <Text style={styles.errorMessage}>
              Registration Failed. Please try again.
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000103",
    paddingTop: StatusBar.currentHeight,
  },
  input: {
    height: 40,
    width: 300,
    color: "#f2f4f7",
    borderColor: "#f2f4f7",
    borderWidth: 1,
    backgroundColor: "#000103",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f2f4f7",
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
    padding: 0,
    width: "80%",
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
  },
});

export default RegisterScreen;

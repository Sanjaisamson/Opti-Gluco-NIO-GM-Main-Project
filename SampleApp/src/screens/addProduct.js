import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
} from "react-native";
import { Text, Avatar, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import CONSTANTS from "../constants/appConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const logo = require("../../assets/opti-gluco-high-resolution-logo-white-transparent.png");
const logoIcon = require("../../assets/opti-gluco-favicon-white.png");
const avatarIcon = require("../../assets/avatar icon .jpg");

const AddProductScreen = () => {
  const [registrationStatus, setRegistrationStatus] = useState("");
  const [productCode, setProductCode] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    refreshAccessToken();
  }, []);

  async function refreshAccessToken() {
    try {
      const response = await axios.get(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/api/refresh`
      );
      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        const responseData = response.data;
        await AsyncStorage.setItem(
          CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN,
          responseData.accessToken
        );
        return responseData.accessToken;
      } else {
        navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
      }
    } catch (error) {
      throw error;
    }
  }

  const handleAddProduct = async () => {
    try {
      let addProductAccessToken = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN
      );
      const decodedToken = jwtDecode(addProductAccessToken);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        const newToken = await refreshAccessToken();
        addProductAccessToken = newToken;
      }
      const requestData = JSON.stringify({
        productCode: productCode,
      });
      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/register`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${addProductAccessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        setRegistrationStatus(CONSTANTS.STATUS_CONSTANTS.COMPLETED);
        navigation.navigate(CONSTANTS.PATH_CONSTANTS.HOME);
      } else {
        setRegistrationStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
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
          marginTop: 200,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={styles.title}>Add new device...</Text>
        </View>
        <View>
          <TextInput
            style={styles.input}
            mode="outlined"
            placeholderTextColor={"#8c8c8c"}
            textColor="white"
            cursorColor="white"
            onChangeText={setProductCode}
            placeholder="Product Code..."
          />
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
            onPress={handleAddProduct}
          >
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              Pair your device
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    alignContent: "center",
    color: "white",
    marginBottom: 30,
  },
  input: {
    width: 300,
    marginBottom: 30,
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
    width: 150,
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

export default AddProductScreen;

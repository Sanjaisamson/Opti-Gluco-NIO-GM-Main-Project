import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Avatar, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import CONSTANTS from "../constants/appConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AddProductScreen = () => {
  const [registrationStatus, setRegistrationStatus] = useState("");
  const [productCode, setProductCode] = useState("");
  const route = useRoute();
  const navigation = useNavigation();

  const { userId } = route.params;

  async function refreshAccessToken(userId) {
    try {
      const requestData = JSON.stringify({
        userId: userId,
      });
      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/api/refresh`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
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
        const newToken = await refreshAccessToken(decodedToken.userId);
        addProductAccessToken = newToken;
      }
      const requestData = JSON.stringify({
        userId: userId,
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
        navigation.navigate(CONSTANTS.PATH_CONSTANTS.HOME, {
          userId: userId,
        });
      } else {
        throw new Error(CONSTANTS.RESPONSE_STATUS.FAILED);
      }
    } catch (error) {
      setRegistrationStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
    }
  };
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Add new Product</Text>
      </View>
      <View>
        <TextInput
          style={styles.input}
          mode="outlined"
          onChangeText={setProductCode}
          placeholder="Product Code..."
        />
      </View>
      <View style={styles.button}>
        <Button
          icon="login"
          mode="elevated"
          title="Register"
          onPress={handleAddProduct}
        ></Button>
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
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    alignContent: "center",
    marginBottom: 30,
  },
  input: {
    width: 300,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
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

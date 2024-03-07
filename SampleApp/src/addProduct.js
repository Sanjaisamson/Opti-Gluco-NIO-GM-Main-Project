import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Avatar, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { Constants } from "../src/constants/env";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AddProductScreen = () => {
  const [registrationStatus, setRegistrationStatus] = useState("");
  const [productCode, setProductCode] = useState("");
  const route = useRoute();
  const navigation = useNavigation();

  const { userId } = route.params;

  const handleAddProduct = async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    try {
      console.log("user....Id", userId);
      const requestData = JSON.stringify({
        userId: userId,
        productCode: productCode,
      });
      const response = await axios.post(
        `http://${Constants.localhost}:${Constants.port}/product/register`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setRegistrationStatus("Success");
        console.log("hiiii");
        navigation.navigate("Home", {
          userId: userId,
        });
      } else {
        setRegistrationStatus("failed");
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      setRegistrationStatus("failed");
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
          right={<TextInput.Affix />}
        />
      </View>
      <View style={styles.button}>
        <Button
          icon="login"
          mode="elevated"
          title="Register"
          onPress={handleAddProduct}
        ></Button>
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

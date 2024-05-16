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
import CONSTANTS from "../constants/appConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const logo = require("../../assets/opti-gluco-high-resolution-logo-white-transparent.png");
const logoIcon = require("../../assets/opti-gluco-favicon-white.png");
const avatarIcon = require("../../assets/avatar icon .jpg");

const Add_IP_Screen = () => {
  const [serverIP, setServerIP] = useState("");
  const navigation = useNavigation();

  const handleAddIP = async () => {
    try {
      await AsyncStorage.setItem(
        CONSTANTS.STORAGE_CONSTANTS.SERVER_IP,
        serverIP
      );
      navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
    } catch (error) {
      throw new Error(500, "Server not Reachable");
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
          <Text style={styles.title}>Your server IP Address...</Text>
        </View>
        <View>
          <TextInput
            style={styles.input}
            mode="outlined"
            placeholderTextColor={"#8c8c8c"}
            textColor="white"
            cursorColor="white"
            onChangeText={setServerIP}
            placeholder="IP Address"
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
            onPress={handleAddIP}
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

export default Add_IP_Screen;

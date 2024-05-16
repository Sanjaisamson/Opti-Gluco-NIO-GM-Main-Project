import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
} from "react-native";
import { Text, Avatar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import CONSTANTS from "../constants/appConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const logo = require("../../assets/opti-gluco-high-resolution-logo-white-transparent.png");
const avatarIcon = require("../../assets/avatar icon .jpg");

const PredictionScreen = () => {
  const [FinalResultStatus, setFinalResultStatus] = useState("");
  const [condition, setCondition] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    handleFinalReading();
  }, []);

  const handleFinalReading = async () => {
    try {
      const condition = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.DIABETIC_CONDITION
      );
      setCondition(condition);
      setFinalResultStatus(CONSTANTS.STATUS_CONSTANTS.COMPLETED);
    } catch (error) {
      console.log(error);
      setFinalResultStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
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
          <Text
            style={styles.title}
          >{`You are in a ${condition} condition`}</Text>
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
            onPress={() => navigation.navigate(CONSTANTS.PATH_CONSTANTS.HOME)}
          >
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              OK
            </Text>
          </TouchableOpacity>
          {FinalResultStatus === CONSTANTS.STATUS_CONSTANTS.COMPLETED && (
            <Text style={styles.successMessage}>Reading Successful......</Text>
          )}
          {FinalResultStatus === CONSTANTS.STATUS_CONSTANTS.FAILED && (
            <Text style={styles.errorMessage}>Reading Failed!!!!!</Text>
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

export default PredictionScreen;

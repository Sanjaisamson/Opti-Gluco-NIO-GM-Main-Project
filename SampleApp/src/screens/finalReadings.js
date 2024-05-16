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

const FinalReadingScreen = () => {
  const [FinalResultStatus, setFinalResultStatus] = useState("");
  const [finalResult, setFinalResult] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    handleFinalReading();
  }, []);

  async function refreshAccessToken() {
    try {
      const server_IP = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.SERVER_IP
      );
      const response = await axios.get(
        `http://${server_IP}:${CONSTANTS.SERVER_CONSTANTS.port}/api/refresh`,
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

  const handleFinalReading = async () => {
    try {
      const server_IP = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.SERVER_IP
      );
      const requestId = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.REQUEST_ID
      );
      const accessToken = await refreshAccessToken();
      const requestData = JSON.stringify({
        requestId: requestId,
      });
      const response = await axios.post(
        `http://${server_IP}:${CONSTANTS.SERVER_CONSTANTS.port}/product/final-result`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        setFinalResultStatus(CONSTANTS.STATUS_CONSTANTS.SUCCESS);
        const responseData = response.data;
        setFinalResult(responseData.final_result);
        return;
      } else {
        setFinalResultStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
      }
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
          <Text style={styles.title}></Text>
          <Text
            style={styles.title}
          >{`Your current sugar level is in between ${finalResult} mg/dl`}</Text>
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
            onPress={() => navigation.goBack()}
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

export default FinalReadingScreen;

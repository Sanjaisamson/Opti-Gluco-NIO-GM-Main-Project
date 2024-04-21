import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import {
  Text,
  Button,
  Avatar,
  TextInput,
  PaperProvider,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import CONSTANTS from "../constants/appConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const logo = require("../../assets/opti-gluco-high-resolution-logo-white-transparent.png");
const logoIcon = require("../../assets/opti-gluco-favicon-white.png");
const avatarIcon = require("../../assets/avatar icon .jpg");

const QuestionnaireScreen = () => {
  const [actionStatus, setActionStatus] = useState("");
  const [A1cValue, setA1cValue] = useState("");
  const [fastingStatus, setFastingStatus] = useState("");
  const [lastFoodTime, setLastFoodTime] = useState("");
  const [familyHealthData, setFamilyHealthData] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [referenceValue, setReferenceValue] = useState("");
  const route = useRoute();
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

  const handleQuestionnaire = async () => {
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
        A1cValue: A1cValue,
        fastingStatus: fastingStatus,
        lastFoodTime: lastFoodTime,
        familyHealthData: familyHealthData,
        bloodPressure: bloodPressure,
      });
      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/patient-data`,
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
        setActionStatus(CONSTANTS.STATUS_CONSTANTS.COMPLETED);
        navigation.goBack();
      } else {
        throw new Error(CONSTANTS.RESPONSE_STATUS.FAILED);
      }
    } catch (error) {
      setActionStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
    }
  };
  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={styles.title}>Please fill this....</Text>
            </View>
            <View>
              <View>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Your current HBA1c value......
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholderTextColor={"#8c8c8c"}
                placeholder="(in %)"
                textColor="white"
                cursorColor="white"
                onChangeText={setA1cValue}
                clearTextOnFocus={true}
                value={A1cValue}
              />
            </View>
            <View>
              <View>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Fasting or Not
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholderTextColor={"#8c8c8c"}
                placeholder="(yes/no)"
                textColor="white"
                cursorColor="white"
                onChangeText={setFastingStatus}
                clearTextOnFocus={true}
                value={fastingStatus}
              />
            </View>
            <View>
              <View>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Your last food before....
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholderTextColor={"#8c8c8c"}
                placeholder="(in hrs)"
                textColor="white"
                cursorColor="white"
                onChangeText={setLastFoodTime}
                clearTextOnFocus={true}
                value={lastFoodTime}
              />
            </View>
            <View>
              <View>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Is any one have daibatics in your family...
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholderTextColor={"#8c8c8c"}
                placeholder="(yes/no)"
                textColor="white"
                cursorColor="white"
                onChangeText={setFamilyHealthData}
                clearTextOnFocus={true}
                value={familyHealthData}
              />
            </View>
            <View>
              <View>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Your Blood Pressure Level....
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholderTextColor={"#8c8c8c"}
                placeholder="(high/normal/low)"
                textColor="white"
                cursorColor="white"
                onChangeText={setBloodPressure}
                clearTextOnFocus={true}
                value={bloodPressure}
              />
            </View>
            <View>
              <View>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Reference Value......
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholderTextColor={"#8c8c8c"}
                placeholder="(value in glucometer)"
                textColor="white"
                cursorColor="white"
                onChangeText={setReferenceValue}
                clearTextOnFocus={true}
                value={referenceValue}
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
                onPress={handleQuestionnaire}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Submit
                </Text>
              </TouchableOpacity>
              {actionStatus === CONSTANTS.STATUS_CONSTANTS.COMPLETED && (
                <Text style={styles.successMessage}>
                  Registration Successful!
                </Text>
              )}
              {actionStatus === CONSTANTS.STATUS_CONSTANTS.FAILED && (
                <Text style={styles.errorMessage}>
                  Registration Failed. Please try again.
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </PaperProvider>
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
    color: "red",
    marginBottom: 30,
  },
  input: {
    width: 300,
    height: 40,
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

export default QuestionnaireScreen;

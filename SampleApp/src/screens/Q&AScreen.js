import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  Text,
  Button,
  Avatar,
  TextInput,
  Portal,
  PaperProvider,
  Dialog,
  Icon,
} from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import CONSTANTS from "../constants/appConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const logo = require("../../assets/opti-gluco-high-resolution-logo-white-transparent.png");
const logoIcon = require("../../assets/opti-gluco-favicon-white.png");
const avatarIcon = require("../../assets/avatar icon .jpg");

const QuestionnaireScreen = () => {
  const [actionStatus, setActionStatus] = useState("");
  const [referenceValue, setReferenceValue] = useState("");
  const [age, setAge] = useState(null);
  const route = useRoute();
  const navigation = useNavigation();
  const [visible, setVisible] = useState(false);

  const showDialog = () => setVisible(true);

  const hideDialog = () => setVisible(false);

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

  const genderData = [
    { label: "Male", value: "1" },
    { label: "Female", value: "0" },
    { label: "Others", value: "2" },
  ];
  const hypertensionData = [
    { label: "Yes", value: "1" },
    { label: "No", value: "0" },
  ];
  const heartdiseaseData = [
    { label: "Yes", value: "1" },
    { label: "No", value: "0" },
  ];
  const smokinghistoryData = [
    { label: "No Info", value: "0" },
    { label: "never", value: "1" },
    { label: "former", value: "2" },
    { label: "Still using", value: "3" },
  ];

  const [isFocus, setIsFocus] = useState(false);
  const [genderValue, setGenderValue] = useState(null);
  const [genderLabel, setGenderLabel] = useState(null);
  const [hypertensionValue, setHypertensionValue] = useState(null);
  const [hypertensionLabel, setHypertensionLabel] = useState(null);
  const [heartdiseaseValue, setHeartdiseaseValue] = useState(null);
  const [heartdiseaseLabel, setHeartdiseaseLabel] = useState(null);
  const [smokingHistoryValue, setSmokingHistoryValue] = useState(null);
  const [smokingHistoryLabel, setSmokingHistoryLabel] = useState(null);
  const [height, setHeight] = useState(null);
  const [weight, setWeight] = useState(null);
  const [BMI_Value, setBMI_Value] = useState(null);
  const [HbA1c_Value, setHbA1c_Value] = useState(null);
  const genderDropdown = () => {
    if (genderValue) {
      return (
        <Text style={[styles.label, { color: "white" }]}>{genderLabel}</Text>
      );
    }
    return null;
  };
  const hypertensionDropdown = () => {
    if (hypertensionValue) {
      return (
        <Text style={[styles.label, { color: "white" }]}>
          {hypertensionLabel}
        </Text>
      );
    }
    return null;
  };
  const heartdiseaseDropdown = () => {
    if (heartdiseaseValue) {
      return (
        <Text style={[styles.label, { color: "white" }]}>
          {heartdiseaseLabel}
        </Text>
      );
    }
    return null;
  };
  const smokingHistoryDropdown = () => {
    if (smokingHistoryValue) {
      return (
        <Text style={[styles.label, { color: "white" }]}>
          {smokingHistoryLabel}
        </Text>
      );
    }
    return null;
  };
  const handleQuestionnaire = async () => {
    try {
      const accessToken = await refreshAccessToken();
      console.log("call reached");
      console.log("hello", accessToken);
      const requestData = JSON.stringify({
        genderValue,
        age,
        hypertensionValue,
        heartdiseaseValue,
        smokingHistoryValue,
        height,
        weight,
        BMI_Value,
        HbA1c_Value,
      });
      console.log("request", requestData);
      console.log("hiii");
      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/patient-data`,
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
              marginLeft: 45,
              marginRight: 45,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={styles.title}>Please fill this....</Text>
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{
                    color: "white",
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                >
                  Your Gender
                </Text>
              </View>
              <View>
                {genderDropdown()}
                <Dropdown
                  style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={genderData}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? "Select your gender" : "..."}
                  searchPlaceholder="Search..."
                  value={genderValue}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={(item) => {
                    setGenderValue(item.value);
                    setGenderLabel(item.label);
                    setIsFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <AntDesign
                      style={styles.icon}
                      color={isFocus ? "blue" : "red"}
                      name="Safety"
                      size={20}
                    />
                  )}
                />
              </View>
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Your Age...
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholderTextColor={"#8c8c8c"}
                textColor="white"
                cursorColor="white"
                onChangeText={setAge}
                clearTextOnFocus={true}
                value={age}
              />
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Have you experienced any effects of hypertension?
                </Text>
              </View>
              <View>
                {hypertensionDropdown()}
                <Dropdown
                  style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={hypertensionData}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? "Select any option" : "..."}
                  searchPlaceholder="Search..."
                  value={hypertensionValue}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={(item) => {
                    setHypertensionValue(item.value);
                    setHypertensionLabel(item.label);
                    setIsFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <AntDesign
                      style={styles.icon}
                      color={isFocus ? "blue" : "red"}
                      name="Safety"
                      size={20}
                    />
                  )}
                />
              </View>
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Have you had a history of heart disease?
                </Text>
              </View>
              <View>
                {heartdiseaseDropdown()}
                <Dropdown
                  style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={heartdiseaseData}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? "Select any option" : "..."}
                  searchPlaceholder="Search..."
                  value={heartdiseaseValue}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={(item) => {
                    setHeartdiseaseValue(item.value);
                    setHeartdiseaseLabel(item.label);
                    setIsFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <AntDesign
                      style={styles.icon}
                      color={isFocus ? "blue" : "red"}
                      name="Safety"
                      size={20}
                    />
                  )}
                />
              </View>
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Do you currently smoke cigarettes or use any tobacco products?
                </Text>
              </View>
              <View>
                {smokingHistoryDropdown()}
                <Dropdown
                  style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  inputSearchStyle={styles.inputSearchStyle}
                  iconStyle={styles.iconStyle}
                  data={smokinghistoryData}
                  search
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? "Select any option" : "..."}
                  searchPlaceholder="Search..."
                  value={smokingHistoryValue}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={(item) => {
                    setSmokingHistoryValue(item.value);
                    setSmokingHistoryLabel(item.label);
                    setIsFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <AntDesign
                      style={styles.icon}
                      color={isFocus ? "blue" : "red"}
                      name="Safety"
                      size={20}
                    />
                  )}
                />
              </View>
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Your Height
                </Text>
              </View>
              <View>
                <TextInput
                  style={styles.input}
                  placeholderTextColor={"#8c8c8c"}
                  placeholder=" in meter "
                  textColor="white"
                  cursorColor="white"
                  onChangeText={setHeight}
                  clearTextOnFocus={true}
                  value={height}
                />
              </View>
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Your Weight
                </Text>
              </View>
              <View>
                <TextInput
                  style={styles.input}
                  placeholderTextColor={"#8c8c8c"}
                  placeholder=" in Kilogram "
                  textColor="white"
                  cursorColor="white"
                  onChangeText={setWeight}
                  clearTextOnFocus={true}
                  value={weight}
                />
              </View>
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Your Latest HbA1c Level
                </Text>
              </View>
              <View>
                <TextInput
                  style={styles.input}
                  textColor="white"
                  cursorColor="white"
                  onChangeText={setHbA1c_Value}
                  clearTextOnFocus={true}
                  value={HbA1c_Value}
                />
              </View>
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Reference Value......
                </Text>
              </View>
              <TextInput
                style={styles.input}
                placeholderTextColor={"#8c8c8c"}
                placeholder=" value in glucometer "
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
                onPress={() => {
                  const BMI = weight / (height * height);
                  const formattedBMI = BMI.toFixed(2);
                  console.log("BMI", formattedBMI);
                  setBMI_Value(formattedBMI);
                  showDialog();
                }}
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
          <View>
            {visible ? (
              <View>
                <Portal>
                  <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Alert</Dialog.Title>
                    <Dialog.Content>
                      <Text variant="bodyMedium">your Age : {age}</Text>
                      <Text variant="bodyMedium">
                        your hypertension : {hypertensionLabel}
                      </Text>
                      <Text variant="bodyMedium">
                        your heart-disease : {heartdiseaseLabel}
                      </Text>
                      <Text variant="bodyMedium">
                        your smoking-status : {smokingHistoryLabel}
                      </Text>
                      <Text variant="bodyMedium">your height : {height}</Text>
                      <Text variant="bodyMedium">your weight : {weight}</Text>
                      <Text variant="bodyMedium">your BMI : {BMI_Value}</Text>
                      <Text variant="bodyMedium">
                        your HbA1c : {HbA1c_Value}
                      </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                      <Button
                        onPress={() => {
                          hideDialog();
                          handleQuestionnaire();
                        }}
                      >
                        Ok
                      </Button>
                    </Dialog.Actions>
                  </Dialog>
                </Portal>
              </View>
            ) : (
              <Text></Text>
            )}
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
    color: "white",
    marginBottom: 30,
  },
  input: {
    width: 300,
    height: 50,
    marginTop: 10,
    marginBottom: 30,
    borderColor: "red",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
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
  dropdown: {
    height: 50,
    width: 300,
    marginTop: 10,
    marginBottom: 30,
    borderColor: "red",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    color: "black",
    left: 22,
    top: 25,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#8c8c8c",
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default QuestionnaireScreen;

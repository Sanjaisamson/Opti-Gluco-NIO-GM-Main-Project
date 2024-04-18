import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode";
import { useRoute, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, Avatar, Card } from "react-native-paper";
import CONSTANTS from "../constants/appConstants";
import axios from "axios";

const Tab = createBottomTabNavigator();

const avatarIcon = require("../../assets/avatar icon .jpg");
const logo = require("../../assets/opti-gluco-high-resolution-logo-white-transparent.png");
const logoIcon = require("../../assets/opti-gluco-favicon-white.png"); //"C:\Users\SANJAI\OneDrive\Documents\Main_Project\SampleApp\assets\opti-gluco-favicon-white.png"
const glucometerIcon = require("../../assets/alt_icon_red.png"); //alt_icon_red.png // optiGluco_alt_favicon.png

function HomeTab() {
  const navigation = useNavigation();
  const route = useRoute();
  const [requestId, setRequestId] = useState("");
  const [status, setStatus] = useState("");

  const windowWidth = Dimensions.get("window").width;
  const [diabaticChanceStatus, setDiabaticChanceStatus] = useState(null);
  const [diabaticChanceValue, setDiabaticChanceValue] = useState(0);
  const [colorCode, setColorCode] = useState("255,255,255");
  useEffect(() => {
    refreshAccessToken();
    getDaibaticChance();
  }, []);
  async function refreshAccessToken() {
    try {
      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/api/refresh`
      );
      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        const responseData = response.data;
        await AsyncStorage.setItem(
          CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN,
          responseData.accessToken
        );
        console.log("refreshed successfully");
        return responseData.accessToken;
      } else {
        setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
        navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
      }
    } catch (error) {
      setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
    }
  }
  useEffect(() => {}, []);

  const getDaibaticChance = async () => {
    let diabticChanceAccessToken = await AsyncStorage.getItem(
      CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN
    );
    const decodedToken = jwtDecode(diabticChanceAccessToken);
    try {
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        const newToken = await refreshAccessToken();
        accessToken = newToken;
      }
      const diabticChanceRequestData = JSON.stringify({
        requestId: requestId,
      });
      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/diabatic-chance`,
        diabticChanceRequestData,
        {
          headers: {
            Authorization: `Bearer ${diabticChanceAccessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log(response.status);
      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        // setStatus(CONSTANTS.STATUS_CONSTANTS.SUCCESS);
        const responseData = response.data;
        console.log(responseData);
        if (responseData === "normal") {
          setDiabaticChanceValue(0.25);
          setColorCode("0,255,0");
          setDiabaticChanceStatus("normal");
        } else if (responseData === "Pre Diabatic") {
          setDiabaticChanceValue(0.5);
          setColorCode("255, 209, 34");
          setDiabaticChanceStatus("Pre Diabatic");
        } else if (responseData === "Diabatic") {
          setDiabaticChanceValue(0.9);
          setColorCode("255, 0, 0");
          setDiabaticChanceStatus("Diabatic");
        }
        return;
      } else {
        console.log("server response error", response.status);
        // setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
        // navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
        return;
      }
    } catch (error) {
      console.log("server Error ", error);
      // setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
    }
  };
  const addProduct = () => {
    try {
      navigation.navigate(CONSTANTS.PATH_CONSTANTS.ADD_PRODUCT);
    } catch (error) {
      setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
    }
  };
  const data = {
    label: ["", "", ""],
    data: [, diabaticChanceValue],
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
            style={styles.image}
          />
        </View>
        <View>
          <Avatar.Image size={30} source={avatarIcon} />
        </View>
      </View>
      <View>
        <View
          style={{
            margin: 20,
            justifyContent: "space-between",
          }}
        >
          <Card style={styles.homeCard}>
            <View
              style={{
                margin: 10,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View style={{ width: "50%" }}>
                <Text style={{ color: "red" }}>Hello,</Text>
                {/* <Text style={{ color: "white", fontSize: 20 }}>{userName}</Text> */}
              </View>
              <View style={{ width: "50%", marginLeft: 20 }}>
                <Image
                  source={logoIcon} // Replace with the path to your exciting image
                  style={styles.image}
                />
              </View>
            </View>
          </Card>
        </View>
        <View style={{ margin: 20 }}>
          <Card style={styles.homeCard}>
            <View
              style={{
                flexDirection: "row",
                margin: 10,
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{ color: "white", fontSize: 20, fontWeight: "bold" }}
                >
                  Connect Your Device
                </Text>
                <Text style={{ color: "#999999", fontSize: 15, marginTop: 10 }}>
                  Pair your device and check your
                </Text>
                <Text style={{ color: "#999999", fontSize: 15 }}>
                  Glucose Level
                </Text>
              </View>
              <View>
                <Image
                  source={glucometerIcon} // Replace with the path to your exciting image
                  style={{ height: 80, width: 70 }}
                />
              </View>
            </View>
            <View>
              <TouchableOpacity
                style={{
                  borderRadius: 5,
                  height: 40,
                  backgroundColor: "#333333", // grey shade
                  justifyContent: "center",
                }}
                onPress={addProduct}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  Connect
                </Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
        <View>
          <ProgressChart
            data={data}
            width={windowWidth}
            height={220}
            strokeWidth={16}
            radius={50}
            chartConfig={{
              backgroundColor: "red",
              backgroundGradientFrom: "#000103",
              backgroundGradientTo: "#000103",
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(${colorCode},${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 20,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "2",
                stroke: "#ffa726",
              },
            }}
            hideLegend={false}
          />
        </View>
        <View>
          {diabaticChanceStatus === null && (
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              Your Status is not updated
            </Text>
          )}
          {diabaticChanceStatus != null && (
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontSize: 20,
                fontWeight: "bold",
              }}
            >
              You are in a {diabaticChanceStatus} condition
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000103",
    paddingTop: StatusBar.currentHeight,
  },
  successMessage: {
    color: "green",
    marginTop: 10,
  },
  errorMessage: {
    color: "red",
    marginTop: 10,
  },
  processMessage: {
    color: "blue",
    marginTop: 10,
  },
  loadingText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white", // Blue color
    textAlign: "center",
  },
  item: {
    marginVertical: 8,
  },
  header: {
    margin: 10,
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  homeCard: {
    backgroundColor: "#1a1a1a",
    height: "auto",
    borderRadius: 20,
    shadowColor: "white",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },
  card: {
    backgroundColor: "#1a1a1a",
    height: "auto",
    borderRadius: 20,
    shadowColor: "white",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },
  cardContent: {
    marginTop: 1,
    borderRadius: 0,
    backgroundColor: "#1a1a1a",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#010205", //"#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  title: {
    fontSize: 15,
    color: "white",
  },
  modalText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  image: {
    width: 200,
    height: 50, // Adjust according to your image size
    resizeMode: "contain",
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 23,
    paddingHorizontal: 25,
    bottom: 0,
    borderWidth: 1,
    borderColor: "red",
  },
});

export default HomeTab;

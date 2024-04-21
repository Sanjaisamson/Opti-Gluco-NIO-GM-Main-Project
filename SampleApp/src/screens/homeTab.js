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
  RefreshControl,
} from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "core-js/stable/atob";
import { useNavigation } from "@react-navigation/native";
import { Text, Avatar, Card, PaperProvider } from "react-native-paper";
import CONSTANTS from "../constants/appConstants";
import handleError from "../configFiles/errorHandler";
import axios from "axios";

const avatarIcon = require("../../assets/avatar icon .jpg");
const logo = require("../../assets/opti-gluco-high-resolution-logo-white-transparent.png");
const logoIcon = require("../../assets/opti-gluco-favicon-white.png"); //"C:\Users\SANJAI\OneDrive\Documents\Main_Project\SampleApp\assets\opti-gluco-favicon-white.png"
const glucometerIcon = require("../../assets/alt_icon_red.png"); //alt_icon_red.png // optiGluco_alt_favicon.png

function HomeTab() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [isChartReady, setisChartReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const windowWidth = Dimensions.get("window").width;
  const [diabaticChanceStatus, setDiabaticChanceStatus] = useState(null);
  const [diabaticChanceValue, setDiabaticChanceValue] = useState(0);
  const [colorCode, setColorCode] = useState("255,255,255");

  useEffect(() => {
    refreshAccessToken();
    getDiabaticChance();
  }, []);

  const refreshAccessToken = async () => {
    try {
      const userName = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.USER_NAME
      );
      setUserName(userName);

      const response = await axios.get(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/api/refresh`
      );

      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        const { accessToken } = response.data;
        await AsyncStorage.setItem(
          CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN,
          accessToken
        );
        return accessToken;
      } else {
        navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
      }
    } catch (error) {
      navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    refreshAccessToken();
    getDiabaticChance();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getDiabaticChance = async () => {
    let accessToken = await refreshAccessToken();
    try {
      const response = await axios.get(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/diabatic-chance`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        const responseData = response.data;

        if (responseData === "normal") {
          setDiabaticChanceValue(0.25);
          setColorCode("0,255,0");
          setDiabaticChanceStatus("normal");
          setisChartReady(true);
        } else if (responseData === "Pre Diabatic") {
          setDiabaticChanceValue(0.5);
          setColorCode("255, 209, 34");
          setDiabaticChanceStatus("Pre Diabatic");
          setisChartReady(true);
        } else if (responseData === "Diabatic") {
          setDiabaticChanceValue(0.9);
          setColorCode("255, 0, 0");
          setDiabaticChanceStatus("Diabatic");
          setisChartReady(true);
        }
      }
    } catch (error) {
      handleError("Error getting Diabatic chance");
    }
  };

  const addProduct = () => {
    try {
      navigation.navigate(CONSTANTS.PATH_CONSTANTS.ADD_PRODUCT);
    } catch (error) {}
  };
  const data = {
    label: ["", "", ""],
    data: [, diabaticChanceValue],
  };
  return (
    <PaperProvider>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
                    <Text
                      style={{
                        color: "white",
                        fontSize: 20,
                        fontWeight: "bold",
                      }}
                    >
                      {userName}
                    </Text>
                  </View>
                  <View style={{ width: "50%", marginLeft: 20 }}>
                    <Image source={logoIcon} style={styles.image} />
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
                      style={{
                        color: "white",
                        fontSize: 20,
                        fontWeight: "bold",
                      }}
                    >
                      Connect Your Device
                    </Text>
                    <Text
                      style={{ color: "#999999", fontSize: 15, marginTop: 10 }}
                    >
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
            {isChartReady ? (
              <View>
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
                      labelColor: (opacity = 1) =>
                        `rgba(255, 255, 255, ${opacity})`,
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
            ) : (
              <Text>Chart Data Not Available</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </PaperProvider>
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

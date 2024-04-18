import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  Dimensions,
  RefreshControl,
  Image,
  TouchableOpacity,
} from "react-native";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, Avatar, Button, Card, PaperProvider } from "react-native-paper";
import CONSTANTS from "../constants/appConstants";
import axios from "axios";

const Tab = createBottomTabNavigator();

const avatarIcon = require("../../assets/avatar icon .jpg");
const logo = require("../../assets/opti-gluco-high-resolution-logo-white-transparent.png");
const logoIcon = require("../../assets/opti-gluco-favicon-white.png"); //"C:\Users\SANJAI\OneDrive\Documents\Main_Project\SampleApp\assets\opti-gluco-favicon-white.png"
const glucometerIcon = require("../../assets/alt_icon_red.png"); //alt_icon_red.png // optiGluco_alt_favicon.png

function ProductTab() {
  const [requestId, setRequestId] = useState("");
  const [userName, setUserName] = useState("");
  const [status, setStatus] = useState(null);
  const [productList, setProductList] = useState([]);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const windowWidth = Dimensions.get("window").width;

  useEffect(() => {
    refreshAccessToken();
    fetchData();
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
  const fetchData = async () => {
    let accessToken = await AsyncStorage.getItem(
      CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN
    );
    const decodedToken = jwtDecode(accessToken);
    try {
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        const newToken = await refreshAccessToken();
        accessToken = newToken;
      }
      const requestBody = {};
      const listProductResponse = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/list-products`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (listProductResponse.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        setProductList(listProductResponse.data);
      }
    } catch (error) {
      setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
    }
  };
  const checkStatus = async (jobId, requestId) => {
    try {
      const checkStatusAccessToken = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN
      );
      const requestData = JSON.stringify({
        jobId: jobId,
        requestId: requestId,
      });
      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/check-job-status`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${checkStatusAccessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        const responseData = response.data;
        return responseData;
      }
    } catch (error) {
      setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
    }
  };

  const readData = async () => {
    let readDataAccessToken = await AsyncStorage.getItem(
      CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN
    );
    const decodedToken = jwtDecode(readDataAccessToken);
    const currentTime = Date.now() / 1000;
    if (decodedToken.exp < currentTime) {
      const newToken = await refreshAccessToken();
      readDataAccessToken = newToken;
    }
    try {
      const requestBody = {};
      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/start-job`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${readDataAccessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        const responseData = response.data;
        setRequestId(responseData.requestId);
        await AsyncStorage.setItem(
          CONSTANTS.STORAGE_CONSTANTS.REQUEST_ID,
          responseData.requestId
        );
        console.log("request id : ", responseData.requestId);
        setStatus(CONSTANTS.STATUS_CONSTANTS.PROGRESS);
        setLoading(true);
        getQuestionnaire();
        const intervalId = setInterval(async () => {
          const currentStatus = await checkStatus(
            responseData.jobId,
            responseData.requestId
          );
          if (
            currentStatus.job_status === CONSTANTS.STATUS_CONSTANTS.COMPLETED
          ) {
            setStatus(CONSTANTS.STATUS_CONSTANTS.COMPLETED);
            clearInterval(intervalId);
            setLoading(false);
            getFinalResult(responseData.requestId);
          }
        }, 30000);
      }
    } catch (error) {
      setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
    }
  };

  const showAlert = ({ msg }) => {
    Alert.alert(
      "Opti-Gluco",
      msg,
      [
        {
          text: "OK",
          onPress: () => {},
        },
      ],
      { cancelable: false }
    );
  };
  const handleRecentData = async () => {
    try {
      navigation.navigate(CONSTANTS.PATH_CONSTANTS.RECENT_DATA);
    } catch (error) {
      setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
      navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
    }
  };
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000); // Simulated refresh
  };
  const getFinalResult = () => {
    try {
      navigation.navigate("FinalReading");
    } catch (error) {
      setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
    }
  };
  const getQuestionnaire = () => {
    try {
      navigation.navigate("Questionnaire");
    } catch (error) {
      setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
    }
  };
  const data = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // optional
        strokeWidth: 5, // optional
      },
    ],
    legend: ["Recent Sugar levels"], // optional
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
            <View style={{ margin: 10 }}>
              {productList && productList.length > 0 ? (
                productList.map((product) => (
                  <Card key={product.product_id} style={styles.card}>
                    <View
                      style={{
                        margin: 20,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View>
                        <Text style={styles.text}>
                          Device Id : {product.product_id}
                        </Text>
                        <Text style={styles.text}>
                          Device Code : {product.product_code}
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
                          width: "100%",
                          height: 40,
                          backgroundColor: "#333333", // grey shade
                          justifyContent: "center",
                        }}
                        onPress={readData}
                      >
                        <Text
                          style={{
                            textAlign: "center",
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          Take Reading
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))
              ) : (
                <Card style={styles.card}>
                  <Card.Content>
                    <Text style={styles.text}>No Products available .....</Text>
                  </Card.Content>
                </Card>
              )}
            </View>
            <View />
            <View>
              {loading ? (
                <View>
                  <View>
                    <Text style={styles.loadingText}>Loading...</Text>
                  </View>
                  <View
                    style={{
                      margin: 20,
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <CountdownCircleTimer
                      isPlaying
                      duration={60}
                      strokeLinecap="round"
                      strokeWidth={5}
                      size={120}
                      rotation="counterclockwise"
                      colors={["#db0a07", "#0718db", "#f0d10c", "#078c24"]}
                      colorsTime={[45, 30, 15, 0]}
                      onComplete={() => {
                        return { shouldRepeat: true, delay: 1 };
                      }}
                    >
                      {({ remainingTime }) => (
                        <Text style={styles.text}>{remainingTime}</Text>
                      )}
                    </CountdownCircleTimer>
                  </View>
                </View>
              ) : (
                <Text></Text>
              )}
            </View>
            {status === CONSTANTS.STATUS_CONSTANTS.COMPLETED && (
              <>
                <Text style={styles.successMessage}>
                  Action Successfully completed........
                </Text>
                {showAlert({ msg: CONSTANTS.STATUS_CONSTANTS.SUCCESS })}
              </>
            )}
            {status === CONSTANTS.STATUS_CONSTANTS.PROGRESS && (
              <>
                <Text style={styles.successMessage}>
                  Action on progress....Please wait
                </Text>
              </>
            )}
            {status === CONSTANTS.STATUS_CONSTANTS.FAILED && (
              <>
                <Text style={styles.errorMessage}>
                  Sorry!! Action Failed. Please try again.
                </Text>
                {showAlert({ msg: CONSTANTS.STATUS_CONSTANTS.ERROR })}
              </>
            )}
          </View>
          {/* <View>
          <Button onPress={getFinalResult}>Final Readings </Button>
        </View> */}
          {/* <View>
          <Button onPress={getQuestionnaire}>Q & A </Button>
        </View> */}
          <View>
            <Button onPress={handleRecentData}>Recent Readings </Button>
          </View>
          <View
            style={{
              marginTop: 70,
            }}
          >
            <LineChart
              data={data}
              width={windowWidth}
              height={220}
              chartConfig={{
                backgroundColor: "red",
                backgroundGradientFrom: "#000103",
                backgroundGradientTo: "#000103",
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 255, 255,${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 20,
                  backgroundColor: "red",
                },
                propsForDots: {
                  r: "7",
                },
              }}
              hideLegend={false}
            />
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

export default ProductTab;

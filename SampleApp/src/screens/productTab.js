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
import { Text, Avatar, Button, Card, PaperProvider } from "react-native-paper";
import CONSTANTS from "../constants/appConstants";
import axios from "axios";
import handleError from "../configFiles/errorHandler";

const avatarIcon = require("../../assets/avatar icon .jpg");
const logo = require("../../assets/opti-gluco-high-resolution-logo-white-transparent.png");
const logoIcon = require("../../assets/opti-gluco-favicon-white.png"); //"C:\Users\SANJAI\OneDrive\Documents\Main_Project\SampleApp\assets\opti-gluco-favicon-white.png"
const glucometerIcon = require("../../assets/alt_icon_red.png"); //alt_icon_red.png // optiGluco_alt_favicon.png

function ProductTab() {
  const [requestId, setRequestId] = useState("");
  const [status, setStatus] = useState(null);
  const [productList, setProductList] = useState([]);
  const [recentReadings, setRecentReadings] = useState([]);
  const [isChartReady, setisChartReady] = useState(false);
  const [readingDates, setReadingDates] = useState([]);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const windowWidth = Dimensions.get("window").width;

  useEffect(() => {
    refreshAccessToken();
    fetchData();
    getChartData();
  }, []);

  const refreshAccessToken = async () => {
    try {
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
        setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
        navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
      }
    } catch (error) {
      setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
      navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
    }
  };
  const fetchData = async () => {
    try {
      const accessToken = await refreshAccessToken();
      const response = await axios.get(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/list-products`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        setProductList(response.data);
      } else {
        handleError("Failed to fetch product list");
      }
    } catch (error) {
      handleError("Error fetching product list", error);
    }
  };
  const checkStatus = async () => {
    try {
      const accessToken = await refreshAccessToken();
      const requestId = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.REQUEST_ID
      );
      const requestData = JSON.stringify({
        requestId: requestId,
      });
      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/check-job-status`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        console.log("checking status", response.data.job_status);
        return response.data;
      } else {
        setLoading(false);
        handleError("Failed to check job status");
      }
    } catch (error) {
      setLoading(false);
      handleError("Error checking job status", error);
    }
  };

  const getQuestionnaire = () => {
    try {
      navigation.navigate("Questionnaire");
    } catch (error) {
      handleError("Error getting questionnaire", error);
    }
  };
  const getFinalResult = () => {
    try {
      navigation.navigate("FinalReading");
    } catch (error) {
      handleError("Error getting final data", error);
    }
  };

  const readData = async () => {
    try {
      let accessToken = await refreshAccessToken();
      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/start-job`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        const { requestId } = response.data;
        setRequestId(requestId);
        await AsyncStorage.setItem(
          CONSTANTS.STORAGE_CONSTANTS.REQUEST_ID,
          requestId
        );
        setStatus(CONSTANTS.STATUS_CONSTANTS.PROGRESS);
        setLoading(true);
        getQuestionnaire();
        const intervalId = setInterval(async () => {
          const currentStatus = await checkStatus();
          if (
            currentStatus.job_status === CONSTANTS.STATUS_CONSTANTS.COMPLETED
          ) {
            setStatus(CONSTANTS.STATUS_CONSTANTS.COMPLETED);
            clearInterval(intervalId);
            getFinalResult(requestId);
            setLoading(false);
          } else if (
            currentStatus.job_status === CONSTANTS.STATUS_CONSTANTS.FAILED
          ) {
            clearInterval(intervalId);
            setLoading(false);
            handleError("Job failed");
          }
        }, 30000);
      }
    } catch (error) {
      setLoading(false);
      handleError("Error starting job", error);
    }
  };
  const onRefresh = () => {
    setRefreshing(true);
    setLoading(false);
    refreshAccessToken();
    fetchData();
    getChartData();
    setTimeout(() => setRefreshing(false), 1000); // Simulated refresh
  };

  const getChartData = async () => {
    try {
      const accessToken = await refreshAccessToken();
      const response = await axios.get(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/chart-data`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        const data = response.data;
        if (data.length === 0) {
          const readings = [0, 0, 0, 0, 0];
          setRecentReadings(readings);
        } else {
          const readings = data.map((item) => {
            const { final_result: reading } = item;
            if (reading === "85-95") {
              return 1;
            } else if (reading === "96-110") {
              return 2;
            } else if (reading === "111-125") {
              return 3;
            }
            return 0;
          });
          setRecentReadings(readings);
        }
        const dates = data.map((item) =>
          new Date(item.createdAt).toLocaleDateString([], {
            weekday: "long",
          })
        );
        setReadingDates(dates);
        setisChartReady(true);
      }
    } catch (error) {
      handleError("Error getting chart data", error);
    }
  };
  return (
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
          }}
        >
          <View>
            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
              <Image source={logo} style={styles.image} />
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Avatar.Image size={30} source={avatarIcon} />
            </TouchableOpacity>
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
                    duration={120}
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
            </>
          )}
        </View>
        {isChartReady ? (
          <View
            style={{
              marginTop: 20,
            }}
          >
            <LineChart
              data={{
                labels: ["1rst", "2nd", "3rd", "4th", "5th"],
                datasets: [
                  {
                    data: [1, 3, 2, 1, 2], //recentReadings,
                  },
                ],
              }}
              width={windowWidth} // from react-native
              height={220}
              yAxisInterval={1} // optional, defaults to 1
              chartConfig={{
                backgroundGradientFrom: "#000103",
                backgroundGradientTo: "#000103",
                decimalPlaces: 2, // optional, defaults to 2dp
                color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "white",
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        ) : (
          <Text style={styles.text}>Chart is not Available</Text>
        )}
        <View>
          <View>
            <TouchableOpacity
              style={{
                borderRadius: 5,
                width: "95%",
                height: 40,
                margin: 10,
                backgroundColor: "#333333", // grey shade
                justifyContent: "center",
              }}
              onPress={() => navigation.navigate("Questionnaire")}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Prediction
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
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
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
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
  loadingText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white", // Blue color
    textAlign: "center",
  },
  image: {
    width: 200,
    height: 50, // Adjust according to your image size
    resizeMode: "contain",
  },
});

export default ProductTab;

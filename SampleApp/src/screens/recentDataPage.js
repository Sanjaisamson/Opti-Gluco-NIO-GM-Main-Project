import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import CONSTANTS from "../constants/appConstants";
import {
  View,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import {
  Text,
  Card,
  PaperProvider,
  Modal,
  Portal,
  Button,
  TextInput,
} from "react-native-paper";
import { jwtDecode } from "jwt-decode";
const logo = require("../../assets/opti-gluco-favicon-black.png"); //C:\Users\SANJAI\OneDrive\Documents\Main_Project\SampleApp\assets\opti-gluco-favicon-black.png

const RecentData = () => {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 4;
  const [manualReferenceData, setManualSugarData] = useState("");
  const windowHeight = Dimensions.get("window").height;
  const [visible, setVisible] = React.useState(false);
  const [selectedReadingId, setSelectedReadingId] = useState("");
  const [status, setStatus] = useState("");
  const [formattedTime, setFormattedTime] = useState("");
  const showModal = (readingId) => {
    setSelectedReadingId(readingId);
    setVisible(true);
  };
  const hideModal = () => {
    setVisible(false);
  };
  const containerStyle = { backgroundColor: "white", padding: 20 };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  async function refreshAccessToken(userId) {
    try {
      const requestData = JSON.stringify({
        userId: userId,
      });
      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/api/refresh`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
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

  const fetchData = async (currentPage) => {
    try {
      let listRecentDataAccessToken = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN
      );
      const decodedToken = jwtDecode(listRecentDataAccessToken);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        const newToken = await refreshAccessToken(decodedToken.userId);
        listRecentDataAccessToken = newToken;
      }

      const newPage = currentPage === 0 ? 1 : currentPage; // Update currentPage correctly
      setCurrentPage(newPage);

      const requestData = JSON.stringify({
        currentPage: newPage,
        itemsPerPage,
      });

      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/recent-readings`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${listRecentDataAccessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        const data = response.data;
        setTotalPages(data.totalPages);
        setItems(data.data);
      }
    } catch (error) {
      throw error;
    }
  };

  const handlePageClick = (p) => {
    setCurrentPage(p);
  };

  const renderPaginationButtons = (currentPage) => {
    const buttons = [];

    for (let page = 1; page <= totalPages; page++) {
      buttons.push(
        <TouchableOpacity
          key={page}
          onPress={() => handlePageClick(page)}
          style={{
            padding: 10,
            margin: 5,
            backgroundColor: page === currentPage ? "blue" : "gray",
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white" }}>{page}</Text>
        </TouchableOpacity>
      );
    }

    return buttons;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000); // Simulated refresh
  };

  const processReadingtime = (createdAt) => {
    try {
      console.log(createdAt);
      const [datePart, timePart] = createdAt.split(" ");
      const timeOnly = timePart.split(".")[0];
      console.log("timeonly", timeOnly);
      const [hours, minutes, seconds] = timeOnly.split(":");
      let hoursIn12Format = parseInt(hours, 10);
      const ampm = hoursIn12Format >= 12 ? "PM" : "AM";
      hoursIn12Format %= 12;
      hoursIn12Format = hoursIn12Format || 12;
      const time12HourFormat = `${hoursIn12Format}:${minutes}:${seconds} ${ampm}`;
      console.log("time at function", time12HourFormat);
      return time12HourFormat;
    } catch (error) {}
  };

  const handleReferenceValue = async () => {
    try {
      hideModal();
      let handleReferenceValueAccessToken = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN
      );
      const decodedToken = jwtDecode(handleReferenceValueAccessToken);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        const newToken = await refreshAccessToken(decodedToken.userId);
        handleReferenceValueAccessToken = newToken;
      }
      const requestData = JSON.stringify({
        referenceValue: manualReferenceData,
        readingId: selectedReadingId,
      });

      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/Add-reference-value`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${handleReferenceValueAccessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        const data = response.data;
        setStatus(CONSTANTS.STATUS_CONSTANTS.SUCCESS);
      }
    } catch (error) {
      throw error;
    }
  };
  return (
    <PaperProvider>
      <View style={{ flex: 1 }}>
        <View>
          <Text style={styles.title}>Your Recent Readings....</Text>
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "column",
          }}
        >
          {items && items.length > 0 ? (
            items.map((item, index) => (
              <Card key={index} style={styles.card}>
                {}
                <Card.Content
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      width: "80%",
                    }}
                  >
                    <Image
                      source={logo} // Replace with the path to your exciting image
                      style={styles.image}
                    />
                    <View style={{ marginLeft: 5 }}>
                      <Text style={{ fontWeight: "bold" }}>
                        {new Date(item.createdAt).toLocaleDateString([], {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "long",
                        })}
                      </Text>
                      <Text style={styles.text}>
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                      <Text style={styles.text}>
                        Blood-Glucose Level:{} mg/dl
                      </Text>
                      <Text style={styles.text}>
                        Reference value :{item.refrence_value} mg/dl
                      </Text>
                    </View>
                  </View>
                  <View style={{}}>
                    <Button
                      onPress={() => {
                        showModal(item.result_id);
                      }}
                    >
                      Add
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Card style={styles.card}>
              <Card.Content>
                <Text>No Readings available...</Text>
              </Card.Content>
            </Card>
          )}
        </View>
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginVertical: 10,
          }}
        >
          {renderPaginationButtons(currentPage, itemsPerPage)}
        </View>
      </View>
      <View>
        <Portal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={containerStyle}
          >
            <View style={[styles.bottomSheet, { height: windowHeight * 0.3 }]}>
              <View
                style={{
                  flex: 0,
                  width: "100%",
                  justifyContent: "space-between",
                  flexDirection: "row",
                }}
              >
                <Text style={styles.modalText}>
                  Add your manual sugar level....
                </Text>
              </View>
              <View>
                <TextInput
                  style={styles.input}
                  mode="outlined"
                  placeholder="Sugar level"
                  onChangeText={setManualSugarData}
                  value={manualReferenceData}
                />
              </View>
              <View style={{ margin: 20 }}>
                <Button
                  icon="check"
                  mode="contained"
                  buttonColor="red"
                  onPress={handleReferenceValue}
                >
                  ADD
                </Button>
              </View>
              <View style={{ margin: 20 }}>
                <Button
                  icon="cancel"
                  mode="elevated"
                  buttonColor="#e8dfdf"
                  textColor="#0f1012"
                  onPress={hideModal}
                >
                  Cancel
                </Button>
              </View>
            </View>
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
};
const styles = StyleSheet.create({
  card: {
    width: "95%",
    marginLeft: "auto",
    marginRight: "auto",
    backgroundColor: "#f0f0f0",
    borderRadius: 0,
    shadowColor: "#010205", //"#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  text: {
    fontSize: 12,
    color: "#333",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    justifyContent: "center",
    margin: 50,
  },
  image: {
    width: 50,
    height: 50, // Adjust according to your image size
    resizeMode: "contain",
  },
});

export default RecentData;

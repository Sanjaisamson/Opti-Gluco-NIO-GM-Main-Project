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
  StatusBar,
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
const logoWhite = require("../../assets/opti-gluco-favicon-white.png");
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

  async function refreshAccessToken() {
    try {
      const server_IP = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.SERVER_IP
      );
      const response = await axios.get(
        `http://${server_IP}:${CONSTANTS.SERVER_CONSTANTS.port}/api/refresh`
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
      const accessToken = await refreshAccessToken();
      const server_IP = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.SERVER_IP
      );
      const newPage = currentPage === 0 ? 1 : currentPage; // Update currentPage correctly
      setCurrentPage(newPage);

      const requestData = JSON.stringify({
        currentPage: newPage,
        itemsPerPage,
      });
      const response = await axios.post(
        `http://${server_IP}:${CONSTANTS.SERVER_CONSTANTS.port}/product/recent-readings`,
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
            backgroundColor: page === currentPage ? "red" : "gray",
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

  const handleReferenceValue = async () => {
    try {
      hideModal();
      const server_IP = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.SERVER_IP
      );
      const accessToken = await refreshAccessToken();
      const requestData = JSON.stringify({
        referenceValue: manualReferenceData,
        readingId: selectedReadingId,
      });
      const response = await axios.post(
        `http://${server_IP}:${CONSTANTS.SERVER_CONSTANTS.port}/product/Add-reference-value`,
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
        setStatus(CONSTANTS.STATUS_CONSTANTS.SUCCESS);
      }
    } catch (error) {
      throw error;
    }
  };
  return (
    <PaperProvider>
      <View style={styles.container}>
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
                      source={logoWhite} // Replace with the path to your exciting image
                      style={styles.image}
                    />
                    <View style={{ marginLeft: 5 }}>
                      <Text style={{ fontWeight: "bold", color: "white" }}>
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
                        Blood-Glucose Level:{item.final_result} mg/dl
                      </Text>
                      <Text style={styles.text}>
                        Reference value :{item.refrence_value} mg/dl
                      </Text>
                    </View>
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
  container: {
    flex: 1,
    backgroundColor: "#000103",
    paddingTop: StatusBar.currentHeight,
  },
  card: {
    width: "95%",
    marginLeft: "auto",
    marginRight: "auto",
    margin: 5,
    backgroundColor: "#1a1a1a",
    borderRadius: 0,
    shadowColor: "#010205", //"#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  text: {
    fontSize: 12,
    color: "white",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    justifyContent: "center",
    margin: 50,
    marginBottom: 30,
    color: "white",
  },
  image: {
    width: 50,
    height: 50, // Adjust according to your image size
    resizeMode: "contain",
  },
});

export default RecentData;

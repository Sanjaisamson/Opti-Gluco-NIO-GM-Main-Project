import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import CONSTANTS from "../constants/appConstants";
import {
  View,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { Text, Card } from "react-native-paper";
import { jwtDecode } from "jwt-decode";

const RecentData = () => {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 3;

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

  return (
    <View style={{ flex: 1 }}>
      <View>
        <Text style={styles.title}>Your Recent Readings....</Text>
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <Text style={styles.text}>Reading - ID: {item.result_id}</Text>
                <Text style={styles.text}>
                  Reading - Time: {item.createdAt}
                </Text>
                <Text style={styles.text}>Blood-Glucose Level :</Text>
                {/* Add additional fields as needed */}
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text>No Products available...</Text>
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
  );
};
const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    shadowColor: "#010205", //"#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    justifyContent: "center",
    margin: 50,
  },
});

export default RecentData;

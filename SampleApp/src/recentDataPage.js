import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Constants } from "../src/constants/env";
import { View, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { Text, Card } from "react-native-paper";
import { jwtDecode } from "jwt-decode";

const RecentData = () => {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  async function refreshAccessToken(userId) {
    try {
      const requestData = JSON.stringify({
        userId: userId,
      });
      const response = await axios.post(
        `http://${Constants.localhost}:${Constants.port}/api/refresh`,
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
        await AsyncStorage.setItem("accessToken", responseData.accessToken);
        return responseData.accessToken;
      } else {
        navigation.navigate("Login");
      }
    } catch (error) {
      throw error;
    }
  }

  const fetchData = async (currentPage) => {
    try {
      let listRecentDataAccessToken = await AsyncStorage.getItem("accessToken");
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
        `http://${Constants.localhost}:${Constants.port}/product/recent-readings`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${listRecentDataAccessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        const data = response.data;
        setTotalPages(data.data.totalPages); // Update total pages
        setItems(data.data.data);
      }
    } catch (error) {
      throw error;
    }
  };

  const handlePageClick = (p) => {
    setCurrentPage(p);
  };

  const renderPaginationButtons = (currentPage, offset, totalPages) => {
    const buttons = [];

    for (let i = currentPage; i < totalPages; i++) {
      buttons.push(
        <TouchableOpacity
          key={i}
          onPress={() => handlePageClick(i)}
          style={{
            padding: 10,
            margin: 5,
            backgroundColor: i === currentPage ? "blue" : "gray",
            borderRadius: 5,
          }}
        >
          <Text style={{ color: "white" }}>{i + 1}</Text>
        </TouchableOpacity>
      );
    }

    return buttons;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000); // Simulated refresh
  };

  const handleEmpty = () => {
    return <Text>No Data</Text>;
  };

  const renderItem = () => {
    return (
      <View>
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <Card key={index}>
              <Card.Title title="Recent readings" />
              <Card.Content>
                <Text>id : {item.result_id}</Text>
                {/* Add additional fields as needed */}
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card>
            <Card.Title title="Recent Readings" />
            <Card.Content>
              <Text>No Products available .....</Text>
            </Card.Content>
          </Card>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items} // Access the 'data' array directly
        renderItem={renderItem}
        keyExtractor={(item) => item.result_id.toString()}
        ListEmptyComponent={handleEmpty}
        windowSize={10}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginVertical: 10,
        }}
      >
        {renderPaginationButtons(currentPage, itemsPerPage, totalPages)}
      </View>
    </View>
  );
};

export default RecentData;

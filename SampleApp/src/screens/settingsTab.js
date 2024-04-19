import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Text,
  Avatar,
  Button,
  Card,
  PaperProvider,
  Modal,
  Portal,
} from "react-native-paper";
import CONSTANTS from "../constants/appConstants";
import axios from "axios";

const Tab = createBottomTabNavigator();

const avatarIcon = require("../../assets/avatar icon .jpg");
const logo = require("../../assets/opti-gluco-high-resolution-logo-white-transparent.png");

function ProfileTab() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const windowHeight = Dimensions.get("window").height;
  const [visible, setVisible] = React.useState(false);
  const [isLoggedOut, setLogout] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    refreshAccessToken();
  }, []);
  const showModal = (content) => {
    setModalContent(content);
    setVisible(true);
  };
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: "red" };
  async function refreshAccessToken() {
    try {
      const userName = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.USER_NAME
      );
      setUserName(userName);
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
      console.log(error);
      setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
    }
  }
  const handleAction = (action) => {
    if (action === "logout") {
      console.log("Logout action clicked");
      logout();
    } else if (action === "Remove Product") {
      console.log("Remove product action clicked");
      removeProduct();
    }
    hideModal();
  };

  const editProfile = () => {
    console.log("edit profile menu clicked !!!");
  };
  const logout = async () => {
    try {
      let logoutAccessToken = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN
      );
      const decodedToken = jwtDecode(logoutAccessToken);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        const newToken = await refreshAccessToken();
        logoutAccessToken = newToken;
      }
      const requestBody = {};
      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/api/logout`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${logoutAccessToken}`,
          },
          withCredentials: true,
        }
      );
      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        await AsyncStorage.removeItem(CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN);
        setLogout(true);
        navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
      } else {
        setLogout(false);
      }
    } catch (error) {
      setLogout(false);
    }
  };
  const handleRecentData = async () => {
    try {
      navigation.navigate(CONSTANTS.PATH_CONSTANTS.RECENT_DATA);
    } catch (error) {
      console.log("error on go to recent data", error);
      setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
      navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
    }
  };
  const removeProduct = async () => {
    try {
      const removeProductAccessToken = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN
      );
      const response = await axios.post(
        `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/remove`,
        {
          headers: {
            Authorization: `Bearer ${removeProductAccessToken}`,
          },
          withCredentials: true,
        }
      );
      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        setStatus(CONSTANTS.STATUS_CONSTANTS.COMPLETED);
      } else {
        setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
      }
    } catch (error) {
      setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
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
            }}
          >
            <View>
              <Image
                source={logo} // Replace with the path to your exciting image
                style={styles.image}
              />
            </View>
          </View>
          <View>
            <Card style={styles.card}>
              <Card.Content>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Avatar.Image size={40} source={avatarIcon} />
                  <View style={{ marginLeft: 10 }}>
                    <Text
                      style={{
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "white",
                        fontSize: 20,
                        marginLeft: 10,
                      }}
                    >
                      {userName}
                    </Text>
                  </View>
                  <View>
                    <Button icon="pen" onPress={editProfile}></Button>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </View>
          <View>
            <View>
              <Text style={styles.header}>Account Settings</Text>
            </View>
            <View style={styles.item}>
              <Card style={styles.cardContent}>
                <Card.Content
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.title}>Logout</Text>
                  </View>
                  <View style={{ marginLeft: 255 }}>
                    <Button
                      icon="chevron-right"
                      onPress={() => showModal("logout")}
                    ></Button>
                  </View>
                </Card.Content>
              </Card>

              <Card style={styles.cardContent}>
                <Card.Content
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <View>
                    <Text style={styles.title}>Remove Product</Text>
                  </View>
                  <View style={{ marginLeft: 190 }}>
                    <Button
                      icon="chevron-right"
                      onPress={() => showModal("Remove Product")}
                    ></Button>
                  </View>
                </Card.Content>
              </Card>
              <Card style={styles.cardContent}>
                <Card.Content
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <View>
                    <Text style={styles.title}>Recent Readings</Text>
                  </View>
                  <View style={{ marginLeft: 185 }}>
                    <Button
                      icon="chevron-right"
                      onPress={handleRecentData}
                    ></Button>
                  </View>
                </Card.Content>
              </Card>
            </View>
            <View>
              <Text style={styles.header}>About</Text>
            </View>
            <View style={styles.item}>
              <Card style={styles.cardContent}>
                <Card.Content
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.title}>Terms and conditions</Text>
                  </View>
                  <View style={{ marginLeft: 155 }}>
                    <Button icon="chevron-right"></Button>
                  </View>
                </Card.Content>
              </Card>
              <Card style={styles.cardContent}>
                <Card.Content
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <View>
                    <Text style={styles.title}>Privacy Policy</Text>
                  </View>
                  <View style={{ marginLeft: 205 }}>
                    <Button icon="chevron-right"></Button>
                  </View>
                </Card.Content>
              </Card>
            </View>
            <View>
              <Text style={styles.header}>Support</Text>
            </View>
            <View style={styles.item}>
              <Card style={styles.cardContent}>
                <Card.Content
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.title}>Contact us</Text>
                  </View>
                  <View style={{ marginLeft: 225 }}>
                    <Button icon="chevron-right"></Button>
                  </View>
                </Card.Content>
              </Card>
              <Card style={styles.cardContent}>
                <Card.Content
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <View>
                    <Text style={styles.title}>Suggest your ideas</Text>
                  </View>
                  <View style={{ marginLeft: 170 }}>
                    <Button icon="chevron-right"></Button>
                  </View>
                </Card.Content>
              </Card>
            </View>
          </View>
        </View>
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
                <Text
                  style={styles.modalText}
                >{`Are you sure, do you want to ${modalContent}`}</Text>
              </View>
              <View style={{ margin: 20 }}>
                <Button
                  icon="check"
                  mode="contained"
                  buttonColor="red"
                  onPress={() => handleAction(modalContent)}
                >
                  Yes, I am
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
    color: "red",
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
    marginTop: 3,
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
export default ProfileTab;

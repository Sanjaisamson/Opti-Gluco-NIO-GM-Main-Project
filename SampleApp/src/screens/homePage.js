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
import AsyncStorage from "@react-native-async-storage/async-storage";
import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode";
import { useRoute, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Text,
  Avatar,
  BottomNavigation,
  Appbar,
  Button,
  Card,
  PaperProvider,
  Modal,
  Portal,
} from "react-native-paper";
import CONSTANTS from "../constants/appConstants";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";

const Tab = createBottomTabNavigator();

const avatarIcon = require("../../assets/avatar icon .jpg");
const logo = require("../../assets/opti-gluco-high-resolution-logo-white-transparent.png");
const logoIcon = require("../../assets/opti-gluco-favicon-white.png"); //"C:\Users\SANJAI\OneDrive\Documents\Main_Project\SampleApp\assets\opti-gluco-favicon-white.png"
const glucometerIcon = require("../../assets/alt_icon_red.png"); //alt_icon_red.png // optiGluco_alt_favicon.png
const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, userName } = route.params;
  const windowHeight = Dimensions.get("window").height;

  async function refreshAccessToken() {
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
      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
        const responseData = response.data;
        await AsyncStorage.setItem(
          CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN,
          responseData.accessToken
        );
        return responseData.accessToken;
      } else {
        setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
        navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
      }
    } catch (error) {
      setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
    }
  }

  function HomeTab() {
    const addProduct = () => {
      try {
        navigation.navigate(CONSTANTS.PATH_CONSTANTS.ADD_PRODUCT, {
          userId: userId,
        });
      } catch (error) {
        setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
      }
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
                  <Text style={{ color: "white", fontSize: 20 }}>
                    {userName}
                  </Text>
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
        </View>
      </View>
    );
  }
  function ProductTab() {
    const route = useRoute();
    const { userId, userName } = route.params;
    const [status, setStatus] = useState(null);
    const [productList, setProductList] = useState([]);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        let accessToken = await AsyncStorage.getItem(
          CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN
        );
        const decodedToken = jwtDecode(accessToken);
        try {
          const currentTime = Date.now() / 1000;
          if (decodedToken.exp < currentTime) {
            const newToken = await refreshAccessToken(decodedToken.userId);
            accessToken = newToken;
          }
          const listProductRequestData = JSON.stringify({
            userId: userId,
          });
          const listProductResponse = await axios.post(
            `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/list-products`,
            listProductRequestData,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );
          if (
            listProductResponse.status === CONSTANTS.RESPONSE_STATUS.SUCCESS
          ) {
            setProductList(listProductResponse.data);
          }
        } catch (error) {
          setStatus(CONSTANTS.STATUS_CONSTANTS.FAILED);
        }
      };
      fetchData();
    }, []);

    const removeProduct = async () => {
      try {
        const removeProductAccessToken = await AsyncStorage.getItem(
          CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN
        );
        const requestData = JSON.stringify({
          userId: userId,
        });
        const response = await axios.post(
          `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/remove`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${removeProductAccessToken}`,
              "Content-Type": "application/json",
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
        const newToken = await refreshAccessToken(decodedToken.userId);
        readDataAccessToken = newToken;
      }
      try {
        const requestData = JSON.stringify({
          userId: userId,
        });
        const response = await axios.post(
          `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/product/start-job`,
          requestData,
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
          setStatus(CONSTANTS.STATUS_CONSTANTS.PROGRESS);
          setLoading(true);
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
              handleRecentData();
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
    return (
      <PaperProvider>
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
                <Text style={styles.loadingText}>Loading...</Text>
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

          <View>
            <Button onPress={handleRecentData}>Recent Readings </Button>
          </View>
        </View>
      </PaperProvider>
    );
  }
  function ProfileTab() {
    const route = useRoute();
    const { userId, userName } = route.params;
    const [visible, setVisible] = React.useState(false);
    const [isLoggedOut, setLogout] = useState(false);

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    const containerStyle = { backgroundColor: "red" };

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
        const requestData = JSON.stringify({
          userId: userId,
        });
        const response = await axios.post(
          `http://${CONSTANTS.SERVER_CONSTANTS.localhost}:${CONSTANTS.SERVER_CONSTANTS.port}/api/logout`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${logoutAccessToken}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
          navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
          await AsyncStorage.removeItem(
            CONSTANTS.STORAGE_CONSTANTS.ACCESS_TOKEN
          );
          setLogout(true);
        } else {
          throw new Error(404);
        }
      } catch (error) {
        setLogout(false);
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
              <View>
                <Avatar.Image size={30} source={avatarIcon} />
              </View>
            </View>
            <View>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Avatar.Image size={50} source={avatarIcon} />
                    <View style={{ marginLeft: 10 }}>
                      <Text
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "white",
                          fontSize: 20,
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
                    <View>
                      <Text style={styles.title}>Logout</Text>
                    </View>
                    <View style={{ marginLeft: 255 }}>
                      <Button icon="chevron-right" onPress={showModal}></Button>
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
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
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
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
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
              <View
                style={[styles.bottomSheet, { height: windowHeight * 0.3 }]}
              >
                <View
                  style={{
                    flex: 0,
                    width: "100%",
                    justifyContent: "space-between",
                    flexDirection: "row",
                  }}
                >
                  <Text style={styles.modalText}>
                    Are you sure! Do you want to Logout?
                  </Text>
                </View>
                <View style={{ margin: 20 }}>
                  <Button
                    icon="check"
                    mode="contained"
                    buttonColor="red"
                    onPress={logout}
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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          activeColor="yellow"
          activeIndicatorStyle={{
            backgroundColor: "red",
          }}
          inactiveColor="white"
          style={{
            backgroundColor: "#000000",
            borderTopColor: "white",
            borderTopWidth: 1,
          }}
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route }) => {
            navigation.navigate(route.name, route.params);
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({
                focused,
                color: "#ffffff",
                size: 24,
              });
            }

            return null;
          }}
          renderLabel={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarLabel) {
              return options.tabBarLabel({
                focused,
                color: "#ffffff",
              });
            }
            return null;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.title;

            return label;
          }}
        />
      )}
    >
      <Tab.Screen
        name="Home"
        component={HomeTab}
        options={{
          tabBarLabel: () => {
            return (
              <Text style={{ color: "#ffffff", textAlign: "center" }}>
                Home
              </Text>
            );
          },
          tabBarIcon: ({ color, size }) => {
            return <Icon name="home" size={size} color={color} />;
          },
          tabBarActiveBackgroundColor: "red",
          tabBarInactiveBackgroundColor: "red",
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductTab}
        initialParams={{
          userId: userId,
          userName: userName,
        }}
        options={{
          tabBarLabel: () => {
            return (
              <Text style={{ color: "#ffffff", textAlign: "center" }}>
                Devices
              </Text>
            );
          },
          tabBarIcon: ({ color, size }) => {
            return <Icon name="devices" size={size} color={color} />;
          },
          tabBarActiveBackgroundColor: "red",
          tabBarInactiveBackgroundColor: "red",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTab}
        initialParams={{
          userId: userId,
          userName: userName,
        }}
        options={{
          tabBarLabel: () => {
            return (
              <Text style={{ color: "#ffffff", textAlign: "center" }}>
                Settings
              </Text>
            );
          },
          tabBarIcon: ({ color, size }) => {
            return <Icon name="account-settings" size={size} color={color} />;
          },
          tabBarActiveBackgroundColor: "red",
          tabBarInactiveBackgroundColor: "red",
        }}
      />
    </Tab.Navigator>
  );
};
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

export default HomeScreen;

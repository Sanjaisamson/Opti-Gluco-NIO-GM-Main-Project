import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  SectionList,
  StatusBar,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode";
import {
  CommonActions,
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Text,
  Avatar,
  BottomNavigation,
  Appbar,
  Button,
  Card,
  PaperProvider,
  Divider,
  Menu,
  Modal,
  Portal,
  IconButton,
} from "react-native-paper";
import { Constants } from "../src/constants/env";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";

const Tab = createBottomTabNavigator();

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [progress, setProgress] = useState(0.2);
  const [progressColor, setProgressColor] = useState("#ff0000");
  const { userId, userName, accessToken } = route.params;

  async function refreshAccessToken() {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
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
        setStatus("refreshing token failed ");
        navigation.navigate("Login");
      }
    } catch (error) {
      setStatus("catched error");
    }
  }

  function HomeTab() {
    return (
      <View style={styles.container}>
        <View>
          <Avatar.Image
            size={100}
            source={require("../assets/avatar icon .jpg")} // C:\Users\SANJAI\OneDrive\Documents\Main_Project\SampleApp\assets\avatar icon .jpg
          />
        </View>
        <Text style={styles.loadingText}>Hi {userName}</Text>
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

    useEffect(() => {
      const fetchData = async () => {
        let accessToken = await AsyncStorage.getItem("accessToken");
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
            `http://${Constants.localhost}:${Constants.port}/product/list-products`,
            listProductRequestData,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );
          if (listProductResponse.status === 200) {
            setStatus("listing devices success");
            setProductList(listProductResponse.data);
          }
        } catch (error) {
          setStatus("catched error");
        }
      };
      fetchData();
    }, []);

    const removeProduct = async () => {
      try {
        const removeProductAccessToken = await AsyncStorage.getItem(
          "accessToken"
        );
        const requestData = JSON.stringify({
          userId: userId,
        });
        const response = await axios.post(
          `http://${Constants.localhost}:${Constants.port}/product/remove`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${removeProductAccessToken}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          setStatus("product removed successfully");
        } else {
          setStatus("product removing failed");
        }
      } catch (error) {
        setStatus("catched error");
      }
    };

    const checkStatus = async (jobId, requestId) => {
      try {
        const checkStatusAccessToken = await AsyncStorage.getItem(
          "accessToken"
        );
        const requestData = JSON.stringify({
          jobId: jobId,
          requestId: requestId,
        });
        const response = await axios.post(
          `http://${Constants.localhost}:${Constants.port}/product/check-job-status`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${checkStatusAccessToken}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          setStatus("status checking successfull");
          const count = 0;
          const responseData = response.data;
          console.log("checker !!!", response.status);
          return responseData;
        }
      } catch (error) {
        setStatus("failed");
      }
    };

    const readData = async () => {
      let readDataAccessToken = await AsyncStorage.getItem("accessToken");
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
          `http://${Constants.localhost}:${Constants.port}/product/start-job`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${readDataAccessToken}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          console.log("response status", response.status);
          const responseData = response.data;
          setStatus("Processing");
          setLoading(true);
          const intervalId = setInterval(async () => {
            const currentStatus = await checkStatus(
              responseData.jobId,
              responseData.requestId
            );
            if (currentStatus.job_status === "Completed") {
              setStatus("Completed");
              clearInterval(intervalId);
              setLoading(false);
            }
          }, 1000);
        }
        console.log(response.status);
      } catch (error) {
        console.log(error);
        setStatus("failed");
      }
    };

    const showAlert = ({ id, msg }) => {
      if (id === 1) {
        Alert.alert(
          "Opti-Gluco",
          msg,
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Home"),
            },
          ],
          { cancelable: false }
        );
      } else {
        console.log("error occured");
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
      }
    };
    const handleRecentData = async () => {
      try {
        navigation.navigate("RecentData");
      } catch (error) {
        setStatus("catched Error");
      }
    };
    const addProduct = () => {
      navigation.navigate("AddProduct", {
        userId: userId,
      });
    };
    console.log("staus", status);
    return (
      <View>
        <Appbar.Header>
          <Appbar.BackAction />
          <Appbar.Content title="Product" />
          <Appbar.Action icon="magnify" />
          <Appbar.Action icon="plus" onPress={addProduct} />
        </Appbar.Header>
        <View>
          <Avatar.Image
            size={100}
            source={require("../assets/avatar icon .jpg")} // C:\Users\SANJAI\OneDrive\Documents\Main_Project\SampleApp\assets\avatar icon .jpg
          />
        </View>
        <Text>Welcome {userName}</Text>
        <View>
          {productList && productList.length > 0 ? (
            productList.map((product) => (
              <Card key={product.product_id}>
                <Card.Title title="My Products" subtitle={product.product_id} />
                <Card.Content>
                  <Text>Product Id : {product.product_id}</Text>
                  <Text>Product Code : {product.product_code}</Text>
                </Card.Content>
                <Card.Actions>
                  <Button onPress={readData}>Start</Button>
                  <Button onPress={removeProduct}>Remove</Button>
                </Card.Actions>
              </Card>
            ))
          ) : (
            <Card>
              <Card.Title title="My Products" subtitle="0" />
              <Card.Content>
                <Text>No Products available .....</Text>
              </Card.Content>
            </Card>
          )}
          <View />
          <View>
            {loading ? (
              <Text style={styles.loadingText}>Loading...</Text>
            ) : (
              <Text></Text>
            )}
          </View>
          {status === "Completed" && (
            <>
              <Text style={styles.successMessage}>
                Reading completed........
              </Text>
              {showAlert({ id: 2, msg: "reading successfull" })}
            </>
          )}
          {status === "product removed successfully" && (
            <>
              <Text style={styles.successMessage}>
                product removed successfully........
              </Text>
              {showAlert({ id: 2, msg: "product removed successfully" })}
            </>
          )}
          {status === "failed" && (
            <>
              <Text style={styles.errorMessage}>
                Reading Failed. Please try again.
              </Text>
              {showAlert({ id: 1, msg: "Sorry, reading failed...." })}
            </>
          )}
        </View>
        <View>
          <Button onPress={handleRecentData}>Recent Readings </Button>
        </View>
        <Appbar.Header />
      </View>
    );
  }
  function ProfileTab() {
    const route = useRoute();
    const { userId, userName, accessToken } = route.params;
    const windowWidth = Dimensions.get("window").width;
    const windowHeight = Dimensions.get("window").height;
    const [visible, setVisible] = React.useState(false);
    const [isLoggedOut, setLogout] = useState(false);

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    const containerStyle = { backgroundColor: "white", padding: 20 };

    const editProfile = () => {
      console.log("edit profile menu clicked !!!");
    };
    const logout = async () => {
      try {
        let logoutAccessToken = await AsyncStorage.getItem("accessToken");
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
          `http://${Constants.localhost}:${Constants.port}/api/logout`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${logoutAccessToken}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          navigation.navigate("Login");
          const responseData = response.data;
          setLogout(true);
          console.log("logout data", responseData);
        } else {
          throw new Error("Network response was not ok");
        }
      } catch (error) {
        console.error("Error logging in user:", error);
      }
    };
    return (
      <PaperProvider>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View>
            <View
              style={{
                alignContent: "center",
                fontWeight: "bold",
                paddingTop: StatusBar.currentHeight,
                marginTop: 30,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: 20,
                }}
              >
                Profile
              </Text>
            </View>
            <View>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Avatar.Image
                      size={50}
                      source={require("../assets/avatar icon .jpg")}
                    />
                    <View style={{ marginLeft: 10 }}>
                      <Text
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
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
                      <Button
                        icon="chevron-right"
                        title="Register"
                        onPress={showModal}
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
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text style={styles.title}>Terms and conditions</Text>
                    </View>
                    <View style={{ marginLeft: 155 }}>
                      <Button icon="chevron-right" title="Register"></Button>
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
                      <Button icon="chevron-right" title="Register"></Button>
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
                      <Button icon="chevron-right" title="Register"></Button>
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
                      <Button icon="chevron-right" title="Register"></Button>
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
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route }) => {
            navigation.navigate(route.name, route.params);
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({ focused, color, size: 24 });
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
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => {
            return <Icon name="home" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductTab}
        initialParams={{
          userId: userId,
          accessToken: accessToken,
          userName: userName,
        }}
        options={{
          tabBarLabel: "Products",
          tabBarIcon: ({ color, size }) => {
            return <Icon name="devices" size={size} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTab}
        initialParams={{
          userId: userId,
          accessToken: accessToken,
          userName: userName,
        }}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => {
            return <Icon name="account" size={size} color={color} />;
          },
        }}
      />
    </Tab.Navigator>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16,
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
  menu: {
    color: "grey",
    marginLeft: 100,
  },
  loadingText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#141414", // Blue color
    textAlign: "center",
    marginTop: 20,
  },
  item: {
    marginVertical: 8,
  },
  header: {
    margin: 10,
    fontSize: 15,
    fontWeight: "bold",
  },
  card: {
    marginTop: 30,
    marginBottom: 30,
    margin: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 0,
    borderBlockColor: "#010205",
    borderStyle: "dashed",
    borderWidth: 1,
    shadowColor: "#010205", //"#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    marginTop: 1,
    borderRadius: 0,
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
  },
  modalText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  bottomSheet: {
    position: "relative",
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

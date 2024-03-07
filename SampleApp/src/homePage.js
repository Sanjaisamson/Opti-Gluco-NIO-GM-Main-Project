import "react-native-gesture-handler";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
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
              Authorization: `Bearer ${accessToken}`,
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
    const addProduct = () => {
      navigation.navigate("AddProduct", {
        userId: userId,
      });
    };

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
          console.log("checker !!!");
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
      } catch (error) {
        setStatus(" catched Error ");
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
          {status === "catched error" && (
            <>
              <Text style={styles.errorMessage}>
                Reading Failed. Please try again.
              </Text>
              {showAlert({ id: 1, msg: "Sorry, reading failed...." })}
            </>
          )}
        </View>
        <Appbar.Header />
      </View>
    );
  }
  function ProfileTab() {
    const route = useRoute();
    const { userId, userName, accessToken } = route.params;

    const [visible, setVisible] = React.useState(false);

    const openMenu = () => setVisible(true);

    const closeMenu = () => setVisible(false);

    const _goBack = () => console.log("Went back");

    const _handleSearch = () => console.log("Searching");

    const menuIcon = () => {
      openMenu();
    };

    const editProfile = () => {
      console.log("edit profile menu clicked !!!");
    };

    const logout = async () => {
      try {
        const requestData = JSON.stringify({
          userId: userId,
        });
        const response = await axios.post(
          `http://${Constants.localhost}:${Constants.port}/api/logout`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          navigation.navigate("Login");
          const responseData = response.data;
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
        <View>
          <Appbar.Header>
            <Appbar.BackAction onPress={_goBack} />
            <Appbar.Content title="Profile" />
            <Appbar.Action icon="magnify" onPress={_handleSearch} />
            <Appbar.Action icon="dots-vertical" onPress={menuIcon} />
          </Appbar.Header>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Menu
              style={styles.menu}
              visible={visible}
              onDismiss={closeMenu}
              anchor={<Button onPress={openMenu}></Button>}
              anchorPosition="bottom"
            >
              <Menu.Item onPress={editProfile} title="Edit Profile" />
              <Menu.Item onPress={logout} title="Logout " />
            </Menu>
          </View>
          <View>
            <Avatar.Image
              size={100}
              source={require("../assets/avatar icon .jpg")} // C:\Users\SANJAI\OneDrive\Documents\Main_Project\SampleApp\assets\avatar icon .jpg
            />
          </View>
          <Text>Hi</Text>
        </View>
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
});

export default HomeScreen;

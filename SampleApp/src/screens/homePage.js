import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StyleSheet, StatusBar } from "react-native";
import { lazy, Suspense } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "core-js/stable/atob";
import { useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, BottomNavigation } from "react-native-paper";
import CONSTANTS from "../constants/appConstants";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";
import Spinner from "./spinner";
import handleError from "../configFiles/errorHandler";

const Tab = createBottomTabNavigator();

const HomeTab = lazy(() => import("./homeTab"));
const ProductTab = lazy(() => import("./productTab"));
const ProfileTab = lazy(() => import("./settingsTab"));
const HomeScreen = () => {
  const navigation = useNavigation();
  useEffect(() => {
    refreshAccessToken();
  }, []);
  async function refreshAccessToken() {
    try {
      const server_IP = await AsyncStorage.getItem(
        CONSTANTS.STORAGE_CONSTANTS.SERVER_IP
      );
      const response = await axios.get(
        `http://${server_IP}:${CONSTANTS.SERVER_CONSTANTS.port}/api/refresh`
      );
      if (response.status === CONSTANTS.RESPONSE_STATUS.SUCCESS) {
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
      handleError("Error getting Home screen", error);
      navigation.navigate(CONSTANTS.PATH_CONSTANTS.LOGIN);
    }
  }
  return (
    <Suspense fallback={<Spinner />}>
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
    </Suspense>
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

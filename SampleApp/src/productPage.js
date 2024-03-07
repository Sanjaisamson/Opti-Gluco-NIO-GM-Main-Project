import "react-native-gesture-handler";
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  CommonActions,
  useRoute,
  useNavigation,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, Avatar, BottomNavigation, Appbar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";

const Tab = createBottomTabNavigator();

const ProductScreen = () => {
  const route = useRoute();
  const { userId, userName, accessToken } = route.params;
  console.log("product page data :", userId, userName, accessToken);
  const [status, setStatus] = useState("");
  const navigation = useNavigation();

  const AddProduct = () => {
    navigation.navigate("AddProduct", {
      userId: userId,
      accessToken: accessToken,
    });
  };
  const ProductTab = () => {
    const _goBack = () => console.log("Went back");

    const _handleSearch = () => console.log("Searching");

    const _handleMore = () => console.log("Shown more");

    const RemoveProduct = async () => {
      try {
        const requestData = JSON.stringify({
          userId: userId,
        });
        const response = await axios.post(
          "http://192.168.1.10:3000/product/remove",
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
          setStatus("Success");
          const responseData = response.data;
          console.log("removed product", responseData);
        } else {
          setStatus("failed");
          throw new Error("Network response was not ok");
        }
      } catch (error) {
        setStatus("failed");
        console.error("Error logging in user:", error);
      }
    };

    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={_goBack} />
          <Appbar.Content title="Product" />
          <Appbar.Action icon="magnify" onPress={_handleSearch} />
          <Appbar.Action icon="dots-vertical" onPress={_handleMore} />
        </Appbar.Header>
        <View style={styles.Avatar}>
          <Avatar.Image
            size={100}
            source={require("../assets/avatar icon .jpg")} // C:\Users\SANJAI\OneDrive\Documents\Main_Project\SampleApp\assets\avatar icon .jpg
          />
        </View>
        <Text style={styles.title}>Hi {userName}</Text>
        <View style={styles.content}>
          <View>
            <Text style={styles.text}>My Product</Text>
          </View>
          <View>
            <Button icon="plus" onPress={AddProduct}>
              Add Your Product
            </Button>
            <Button icon="minus" onPress={RemoveProduct}>
              Remove My Product
            </Button>
          </View>
          <View>
            {status === "Success" && (
              <Text style={styles.successMessage}>
                Product Removed Successfully
              </Text>
            )}
            {status === "failed" && (
              <Text style={styles.errorMessage}>Action Failed!!!!</Text>
            )}
          </View>
        </View>
        <Appbar.Header />
      </View>
    );
  };
  function HomeTab() {
    console.log("home tab clicked");
  }
  function ProfileTab() {
    console.log("profile tab clicked");
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
        initialParams={{
          userId: userId,
          accessToken: accessToken,
          userName: userName,
        }}
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
    backgroundColor: "#fff",
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30,
  },
  Avatar: {
    marginLeft: 130,
    marginRight: 130,
    backgroundColor: "#fff",
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    fontVariant: "small-caps",
  },
  ButtonView: {
    margin: 10,
    alignContent: "center",
    alignItems: "center",
  },
  successMessage: {
    color: "green",
    marginTop: 10,
  },
  errorMessage: {
    color: "red",
    marginTop: 10,
  },
});

export default ProductScreen;

import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import CONSTANTS from "../constants/appConstants";

const splashImg = require("../../assets/blood drop.png");
const logo = require("../../assets/logo_black.png");

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate(CONSTANTS.PATH_CONSTANTS.Add_IP_Screen);
    }, 3000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.image} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  Text: {
    color: "black",
    fontWeight: "bold",
    fontSize: 40,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
});

export default SplashScreen;

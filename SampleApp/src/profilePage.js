import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import {
  Text,
  Button,
  Avatar,
  TextInput,
  PaperProvider,
  Divider,
  Menu,
  Appbar,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import { ScrollView } from "react-native-gesture-handler";

const ProfileScreen = () => {
  const route = useRoute();
  const { userId, userName, accessToken } = route.params;
  console.log("profile page data :", userId, userName, accessToken);

  const _goBack = () => console.log("Went back");

  const _handleSearch = () => console.log("Searching");

  const _handleMore = () => console.log("Shown more");

  return (
    <ScrollView>
      <Appbar.Header style={styles.container}>
        <Appbar.BackAction onPress={_goBack} />
        <Appbar.Content title="Profile" />
        <Appbar.Action icon="magnify" onPress={_handleSearch} />
        <Appbar.Action icon="dots-vertical" onPress={_handleMore} />
      </Appbar.Header>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
    margin: 100,
    alignContent: "center",
    alignItems: "center",
  },
});

export default ProfileScreen;

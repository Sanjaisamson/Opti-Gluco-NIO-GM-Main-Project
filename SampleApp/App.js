import React from "react";
import { NavigationContainer, useRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import "firebase/auth";
import SplashScreen from "./src/splashScreen";
import LoginPage from "./src/loginPage";
import RegistrationPage from "./src/registerPage";
import HomePage from "./src/homePage";
import AddProduct from "./src/addProduct";
import ProfileScreen from "./src/profilePage";
import { createDrawerNavigator } from "@react-navigation/drawer";
import ProductScreen from "./src/productPage";
// import SignupPage from './src/SignupPage';
// import GlucoseDisplayPage from './src/GlucoseDisplayPage';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegistrationPage} />
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Product" component={ProductScreen} />
        <Stack.Screen name="AddProduct" component={AddProduct} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

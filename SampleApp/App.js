import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "./src/splashScreen";
import LoginPage from "./src/loginPage";
import RegistrationPage from "./src/registerPage";
import HomePage from "./src/homePage";
import AddProduct from "./src/addProduct";
import RecentData from "./src/recentDataPage";

const Stack = createNativeStackNavigator();

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
        <Stack.Screen name="AddProduct" component={AddProduct} />
        <Stack.Screen name="RecentData" component={RecentData} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

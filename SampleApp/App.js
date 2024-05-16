import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "./src/screens/splashScreen";
import LoginPage from "./src/screens/loginPage";
import RegistrationPage from "./src/screens/registerPage";
import HomePage from "./src/screens/homePage";
import AddProduct from "./src/screens/addProduct";
import RecentData from "./src/screens/recentDataPage";
import FinalReading from "./src/screens/finalReadings";
import Questionnaire from "./src/screens/Q&AScreen";
import Add_IP_Screen from "./src/screens/IPSettingPage";
import PredictionScreen from "./src/screens/predictionScreen";

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Add_IP" component={Add_IP_Screen} />
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegistrationPage} />
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="AddProduct" component={AddProduct} />
        <Stack.Screen name="RecentData" component={RecentData} />
        <Stack.Screen name="FinalReading" component={FinalReading} />
        <Stack.Screen name="Questionnaire" component={Questionnaire} />
        <Stack.Screen name="Prediction" component={PredictionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import 'firebase/auth';
import SplashScreen from './src/splashScreen';
import LoginPage from './src/loginPage';
import RegistrationPage from './src/registerPage';
import HomePage from './src/homePage';
// import SignupPage from './src/SignupPage';
// import GlucoseDisplayPage from './src/GlucoseDisplayPage';

const Stack = createNativeStackNavigator();


const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegistrationPage} />
        <Stack.Screen name="Home" component={HomePage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

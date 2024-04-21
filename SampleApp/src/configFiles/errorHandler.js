import { Alert } from "react-native";

const handleError = (errorMessage, error = null) => {
  if (error) {
    console.error(`Error: ${errorMessage}`, error);
  } else {
    console.error(`Error: ${errorMessage}`);
  }
  Alert.alert(
    "Error",
    errorMessage,
    [
      {
        text: "OK",
        onPress: () => {},
      },
    ],
    { cancelable: false }
  );
};

export default handleError;

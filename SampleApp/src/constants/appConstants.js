("REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.3 npx expo start");

const SERVER_CONSTANTS = {
  localhost: "192.168.29.121",
  port: "3000",
};
const RESPONSE_STATUS = {
  SUCCESS: 200 || 201,
  FAILED: 400 || 404 || 500,
};

const STORAGE_CONSTANTS = {
  ACCESS_TOKEN: "accessToken",
};
const PATH_CONSTANTS = {
  HOME: "Home",
  LOGIN: "Login",
  REGISTER: "Register",
  SPLASH: "Splash",
  ADD_PRODUCT: "AddProduct",
  RECENT_DATA: "RecentData",
};

const STATUS_CONSTANTS = {
  SUCCESS: "Success",
  COMPLETED: "Completed",
  FAILED: "Failed",
  PROGRESS: "On-progress",
  ERROR: "Error",
};

export default {
  SERVER_CONSTANTS,
  PATH_CONSTANTS,
  STATUS_CONSTANTS,
  RESPONSE_STATUS,
  STORAGE_CONSTANTS,
};

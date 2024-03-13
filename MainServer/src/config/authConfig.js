require("dotenv").config();

const tokenExpiry = {
  refreshTokenExp: "7d",
  accessTokenExp: "20m",
};

const cookieExpiry = {
  maxAge: 24 * 60 * 60 * 1000,
};

const secrets = {
  accessToken: process.env.ACCESS_TOKEN_SECRET,
  refreshToken: process.env.REFRESH_TOKEN_SECRET,
};
const authConfig = {
  tokenExpiry,
  cookieExpiry,
  secrets,
};

module.exports = {
  authConfig,
};

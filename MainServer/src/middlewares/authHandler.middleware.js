require("dotenv").config();
const jwt = require("jsonwebtoken");
const userServices = require("../services/userService");
const { authConfig } = require("../config/authConfig");
const { userTable } = require("../model/userModel");
const { tokenTable } = require("../model/refreshTokenModel");

async function accessTokenVerification(req, res, next) {
  try {
    const header = req.headers["authorization"];
    const bearerLessToken = header.split(" ")[1];
    const verifiedTokenData = jwt.verify(
      bearerLessToken,
      authConfig.secrets.accessToken
    );
    const authenticatedUser = await userTable.findOne({
      where: {
        user_id: verifiedTokenData.userId,
      },
    });
    if (!authenticatedUser) {
      throw new Error("Invalid User");
    }
    req.user = authenticatedUser;
    next();
  } catch (error) {
    return res.sendStatus(404);
  }
}

async function refreshTokenVerification(req, res) {
  try {
    const refreshToken = req.cookies.rtoken;
    const decodedToken = jwt.verify(
      refreshToken,
      authConfig.secrets.refreshToken
    );
    const user = await tokenTable.findOne({
      where: {
        user_id: decodedToken.userId,
      },
    });
    if (!user || user.length) {
      throw new Error("Invalid user");
    }
    const newToken = await userServices.generateTokens(user.user_id);
    return res.send({
      accessToken: newToken.accessToken,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
}

module.exports = { accessTokenVerification, refreshTokenVerification };

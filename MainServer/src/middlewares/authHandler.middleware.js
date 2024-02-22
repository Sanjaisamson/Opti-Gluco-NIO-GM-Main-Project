require("dotenv").config();
const jwt = require("jsonwebtoken");
const httpErrors = require("http-errors");
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
      process.env.ACCESS_TOKEN_SECRET
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
    throw error;
  }
}

async function refreshTokenVerification(req, res, next) {
  try {
    const refreshToken = req.cookies.rtoken;
    const decodedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await tokenTable.findOne({
      where: {
        user_id: decodedToken.userId,
      },
    });
    if (!user || user.length) {
      throw new Error("Invalid user");
    }
    const newTokens = await userServices.generateTokens(user.user_id);
    return res.send({
      accessToken: newTokens.accessToken,
    });
    next();
  } catch (error) {
    throw error;
  }
}

module.exports = { accessTokenVerification, refreshTokenVerification };

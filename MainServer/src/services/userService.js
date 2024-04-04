const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { authConfig } = require("../config/authConfig");
const { userTable } = require("../model/userModel");
const { tokenTable } = require("../model/refreshTokenModel");
const {
  RESPONSE_STATUS_CONSTANTS,
  ARRAY_CONSTANTS,
} = require("../constants/appConstants");

async function createUser(userName, mailId, password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const users = await userTable.findOne({
      where: {
        user_mail: mailId,
      },
    });
    if (!users || users.length === 0) {
      await userTable.create({
        user_name: userName,
        user_mail: mailId,
        user_password: hashedPassword,
      });
      return;
    }
  } catch (error) {
    throw error;
  }
}

async function loginUser(mailId, password) {
  try {
    const users = await userTable.findOne({
      where: {
        user_mail: mailId,
      },
    });
    if (!users || users.length === ARRAY_CONSTANTS.LENGTH_ZERO) {
      throw new Error(
        RESPONSE_STATUS_CONSTANTS.FAILED,
        "sorry user does not exist!!"
      );
    }
    const isVerified = await bcrypt.compare(password, users.user_password);
    if (!isVerified) {
      throw new Error(
        RESPONSE_STATUS_CONSTANTS.FAILED,
        "Incorrect Password!!!"
      );
    }
    return users;
  } catch (err) {
    throw err;
  }
}

async function generateTokens(userId) {
  try {
    const accessToken = jwt.sign({ userId }, authConfig.secrets.accessToken, {
      expiresIn: authConfig.tokenExpiry.accessTokenExp,
    });
    const refreshToken = jwt.sign({ userId }, authConfig.secrets.refreshToken, {
      expiresIn: authConfig.tokenExpiry.refreshTokenExp,
    });
    return { accessToken: accessToken, refreshToken: refreshToken };
  } catch (err) {
    throw err;
  }
}

async function saveToken(userId, refreshToken) {
  try {
    const users = await tokenTable.findOne({ where: { user_id: userId } });
    if (!users || users.length === ARRAY_CONSTANTS.LENGTH_ZERO) {
      const newUser = await tokenTable.create({
        user_id: userId,
        refresh_token: refreshToken,
      });
    }
    users.refresh_token = refreshToken;
    await users.save();
    return;
  } catch (error) {
    throw err;
  }
}

async function logoutUser(userId) {
  try {
    const users = await tokenTable.destroy({
      where: {
        user_id: userId,
      },
    });
    if (!users || users.length === ARRAY_CONSTANTS.LENGTH_ZERO) {
      return;
    }
    return users;
  } catch (err) {
    throw err;
  }
}
module.exports = {
  createUser,
  loginUser,
  generateTokens,
  saveToken,
  logoutUser,
};

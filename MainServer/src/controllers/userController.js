const httpErrors = require("http-errors");
const userServices = require("../services/userService");
const { authConfig } = require("../config/authConfig");
const { RESPONSE_STATUS_CONSTANTS } = require("../constants/appConstants");

async function createUser(req, res) {
  try {
    console.log("call for create user.....");
    const { userName, mailId, password, age, gender } = req.body;
    await userServices.createUser(userName, mailId, password, age, gender);
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SUCCESS);
  } catch (error) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function loginUser(req, res) {
  try {
    console.log("call for login....");
    const { mailId, password } = req.body;
    const loginResponse = await userServices.loginUser(mailId, password);
    const { refreshToken, accessToken } = await userServices.generateTokens(
      loginResponse.user_id
    );
    await userServices.saveToken(loginResponse.user_id, refreshToken);
    res.cookie("rtoken", refreshToken, {
      httpOnly: true,
      maxAge: authConfig.cookieExpiry.maxAge,
    });
    console.log(loginResponse.user_name);
    return res
      .status(RESPONSE_STATUS_CONSTANTS.SUCCESS)
      .json({ accessToken: accessToken, userName: loginResponse.user_name });
  } catch (error) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function logoutUser(req, res) {
  try {
    console.log("call for logout user....");
    await userServices.logoutUser(req.user.user_id);
    res.clearCookie("jwt");
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SUCCESS);
  } catch (err) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

module.exports = {
  loginUser,
  createUser,
  logoutUser,
};

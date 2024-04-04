const httpErrors = require("http-errors");
const userServices = require("../services/userService");
const { authConfig } = require("../config/authConfig");
const { RESPONSE_STATUS_CONSTANTS } = require("../constants/appConstants");

async function createUser(req, res) {
  try {
    const { userName, mailId, password } = req.body;
    await userServices.createUser(userName, mailId, password);
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SUCCESS);
  } catch (error) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function loginUser(req, res) {
  try {
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
    res.send({ accessToken, loginResponse });
  } catch (error) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function logoutUser(req, res) {
  try {
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

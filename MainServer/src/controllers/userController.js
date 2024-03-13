const httpErrors = require("http-errors");
const userServices = require("../services/userService");
const { authConfig } = require("../config/authConfig");

async function createUser(req, res) {
  try {
    const { userName, mailId, password } = req.body;
    await userServices.createUser(userName, mailId, password);
    return res.sendStatus(200);
  } catch (err) {
    const signupError = httpErrors(
      401,
      "Unauthorized : User Registration failed!"
    );
    return res.send(signupError);
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
    const loginError = httpErrors(401, "Unauthorized : User Login failed!");
    return res.send(loginError);
  }
}

async function logoutUser(req, res) {
  try {
    await userServices.logoutUser(req.user.user_id);
    res.clearCookie("jwt");
    return res.sendStatus(200);
  } catch (err) {
    const logoutError = httpErrors(401, "Unauthorized : logout failed!");
    return res.send(logoutError);
  }
}

module.exports = {
  loginUser,
  createUser,
  logoutUser,
};

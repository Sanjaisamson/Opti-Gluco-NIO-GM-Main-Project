const httpErrors = require("http-errors");
const userServices = require("../services/userService");
const { authConfig } = require("../config/authConfig");

async function createUser(req, res, next) {
  try {
    const { userName, mailId, password } = req.body;
    const { userId } = await userServices.createUser(
      userName,
      mailId,
      password
    );
    return res.sendStatus(200);
  } catch (err) {
    const signupError = httpErrors(
      401,
      "Unauthorized : User Registration failed!"
    );
    return res.send(signupError);
  }
}

async function loginUser(req, res, next) {
  try {
    const { mailId, password } = req.body;
    const userServicesRes = await userServices.loginUser(mailId, password);
    const { refreshToken, accessToken } = await userServices.generateTokens(
      userServicesRes.user_id
    );
    await userServices.saveToken(userServicesRes.user_id, refreshToken);
    res.cookie("rtoken", refreshToken, {
      httpOnly: true,
      maxAge: authConfig.cookieExpiry.maxAge,
    });
    res.send({ accessToken, userServicesRes });
  } catch (error) {
    const loginError = httpErrors(401, "Unauthorized : User Login failed!");
    return res.send(loginError);
  }
}

async function logoutUser(req, res, next) {
  try {
    const logout = await userServices.logoutUser(req.user.user_id);
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

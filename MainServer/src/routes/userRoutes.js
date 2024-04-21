const express = require("express");
const appRouter = express.Router();
const userController = require("../controllers/userController");
const authHandler = require("../middlewares/authHandler.middleware");

appRouter.post("/login", userController.loginUser);
appRouter.post("/signup", userController.createUser);
appRouter.get("/refresh", authHandler.refreshTokenVerification);
appRouter.post(
  "/logout",
  authHandler.accessTokenVerification,
  userController.logoutUser
);

module.exports = appRouter;

const express = require("express");
const appRouter = express.Router();
const clientController = require("../controllers/clientController");

appRouter.post("/start-job", clientController.initiateJob);
appRouter.post("/register-client", clientController.registerClient);

module.exports = appRouter;

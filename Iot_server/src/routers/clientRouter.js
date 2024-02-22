const express = require("express");
const appRouter = express.Router();
const clientController = require("../controllers/clientController");

appRouter.post("/start-job", clientController.initiateJob);

module.exports = appRouter;

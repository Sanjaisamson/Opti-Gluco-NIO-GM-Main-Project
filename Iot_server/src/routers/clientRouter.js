const express = require("express");
const appRouter = express.Router();
const clientController = require("../controllers/clientController");

appRouter.post("/read-data", clientController.readData);
appRouter.post("/status", clientController.checkstatus);

module.exports = appRouter;

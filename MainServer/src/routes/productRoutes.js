const express = require("express");
const productRouter = express.Router();
const productController = require("../controllers/productController");
const authHandler = require("../middlewares/authHandler.middleware");

productRouter.post(
  "/register",
  authHandler.accessTokenVerification,
  productController.registerProduct
);
productRouter.post(
  "/remove",
  authHandler.accessTokenVerification,
  productController.removeProduct
);
productRouter.post(
  "/start-job",
  authHandler.accessTokenVerification,
  productController.initiateJob
);
productRouter.post(
  "/list-products",
  authHandler.accessTokenVerification,
  productController.listProducts
);
productRouter.post(
  "/recent-readings",
  authHandler.accessTokenVerification,
  productController.listRecentReadings
);
productRouter.post(
  "/Add-reference-value",
  authHandler.accessTokenVerification,
  productController.addReferenceValue
);
productRouter.post("/update-status", productController.updateStatus);
productRouter.post("/results", productController.processingResult);
productRouter.post("/check-job-status", productController.checkJobStatus);
productRouter.post(
  "/final-result",
  authHandler.accessTokenVerification,
  productController.getFinalResult
);
productRouter.post(
  "/patient-data",
  authHandler.accessTokenVerification,
  productController.setPatientData
);
productRouter.post(
  "/diabatic-chance",
  authHandler.accessTokenVerification,
  productController.predictDiabaticChance
);

module.exports = productRouter;

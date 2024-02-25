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
productRouter.post("/update-status", productController.updatestatus);
productRouter.post("/results", productController.getResult);

module.exports = productRouter;

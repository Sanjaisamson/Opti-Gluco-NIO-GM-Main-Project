const http = require("http");
const { productTable } = require("../model/productModel");
const { response } = require("express");
const { requestLogTable } = require("../model/requestLogModel");
const { ulid } = require("ulid");

async function registerProduct(data) {
  try {
    const product = await productTable.findOne({
      where: {
        user_id: data.userId,
      },
    });
    if (!product) {
      const newProduct = await productTable.create({
        user_id: data.userId,
        user_name: data.userName,
        product_code: data.productCode,
      });
      return newProduct;
    }
    throw new Error("sorry user already have a product");
  } catch (error) {
    throw error;
  }
}

async function removeProduct(userID) {
  try {
    const product = await productTable.findOne({
      where: {
        user_id: userID,
      },
    });
    if (!product || product.length === 0) {
      throw new Error("this user has no registered product");
    }
    const user = await productTable.destroy({
      where: {
        user_id: userID,
      },
    });
    return product.user_name;
  } catch (error) {
    throw error;
  }
}

async function readData(userId) {
  try {
    const product = await productTable.findOne({
      where: {
        user_id: userId,
      },
    });
    if (!product || product.length === 0) {
      throw new Error("no device is registered");
    }
    const requestId = ulid();
    const requestData = JSON.stringify({
      user_id: userId,
      product_code: product.product_code,
      requestId: requestId,
      captureDelay: 8000,
      totalTime: 128000,
    });
    const options = {
      hostname: "localhost",
      port: 3500,
      path: "/client/read-data",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestData),
      },
    };
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let responseData = "";

        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      req.write(requestData);
      req.end();
    });
  } catch (error) {
    throw error;
  }
}

module.exports = { registerProduct, removeProduct, readData };

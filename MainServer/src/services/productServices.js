const http = require("http");
const { productTable } = require("../model/productModel");
const { response } = require("express");
const { requestLogTable } = require("../model/requestLogModel");
const { ulid } = require("ulid");
const { READ_DATA_CONSTANTS } = require("../constants/requestConstants");
const { post } = require("../routes/productRoutes");

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

async function initiateJob(userId) {
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
    const newRequest = await requestLogTable.create({
      user_id: userId,
      product_code: product.product_code,
      request_code: requestId,
    });
    const requestData = JSON.stringify({
      productCode: product.product_code,
      requestCode: requestId,
    });
    const response = await fetch("http://localhost:3500/client/start-job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestData),
      },
      body: requestData,
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log(data);
    return {
      jobId: data.jobId,
      jobStatus: data.jobStatus,
      requestId: requestId,
    };
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}
async function updateJobData(jobId, jobStatus, requestId) {
  try {
    console.log("datasss.....", jobId, jobStatus, requestId);
    const updatedJobData = await requestLogTable.findOne({
      where: {
        request_code: requestId,
      },
    });
    console.log("job id at near", jobId);
    updatedJobData.job_id = jobId;
    updatedJobData.job_status = jobStatus;
    await updatedJobData.save();
    return updatedJobData;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  registerProduct,
  removeProduct,
  initiateJob,
  updateJobData,
};

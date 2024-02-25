const http = require("http");
const { productTable } = require("../model/productModel");
const { response } = require("express");
const { requestLogTable } = require("../model/requestLogModel");
const { ulid } = require("ulid");
const { READ_DATA_CONSTANTS } = require("../constants/requestConstants");
const { post } = require("../routes/productRoutes");
const { cloudinary } = require("../databases/cloudinary");

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
      userId: userId,
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
    const updatedJobData = await requestLogTable.findOne({
      where: {
        request_code: requestId,
      },
    });
    updatedJobData.job_id = jobId;
    updatedJobData.job_status = jobStatus;
    await updatedJobData.save();
    return updatedJobData;
  } catch (error) {
    console.error("There was a problem with updateJobData operation:", error);
    throw error;
  }
}
async function updateStatus(requestId, jobStatus) {
  try {
    const updatedJobData = await requestLogTable.findOne({
      where: {
        request_code: requestId,
      },
    });
    updatedJobData.job_status = jobStatus;
    await updatedJobData.save();
    return updatedJobData;
  } catch (error) {}
}

async function getResult(images, requestId, userId) {
  try {
    console.log("at main server staring level", Array.isArray(images));
    console.log(images);
    const uploadedImages = [];
    for (let i = 0; i < images.length; i++) {
      const imageData = images[i].data.data;
      const result = await cloudinary.uploader.upload(imageData, {
        folder: `${requestId}.${userId}`,
        public_id: `${requestId}.${i + 1}`,
      });
      console.log(result);
      uploadedImages.push(result.secure_url);
    }

    return uploadedImages;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  registerProduct,
  removeProduct,
  initiateJob,
  updateJobData,
  updateStatus,
  getResult,
};

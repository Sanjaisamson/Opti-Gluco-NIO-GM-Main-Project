const http = require("http");
const fs = require("fs");
const path = require("path");
const { ulid } = require("ulid");
const { productTable } = require("../model/productModel");
const { requestLogTable } = require("../model/requestLogModel");
const { resultDataTable } = require("../model/resultDataModel");
const { READ_DATA_CONSTANTS } = require("../constants/requestConstants");
const { cloudinary } = require("../databases/cloudinary");
const { defaultStorageDir } = require("../config/storagePath");
const {
  JOB_STATUS,
} = require("../../../Iot_server/src/constants/jobConstants");

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
  const requestId = ulid();
  try {
    const product = await productTable.findOne({
      where: {
        user_id: userId,
      },
    });
    if (!product || product.length === 0) {
      throw new Error("no device is registered");
    }
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
      const request = await requestLogTable.findOne({
        where: {
          request_code: requestId,
        },
      });
      request.job_status = JOB_STATUS.FAILED;
      request.save();
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return {
      jobId: data.jobId,
      jobStatus: data.jobStatus,
      requestId: requestId,
    };
  } catch (error) {
    const request = await requestLogTable.findOne({
      where: {
        request_code: requestId,
      },
    });
    request.job_status = JOB_STATUS.FAILED;
    request.save();
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
  } catch (error) {
    const request = await requestLogTable.findOne({
      where: {
        request_code: requestId,
      },
    });
    request.job_status = JOB_STATUS.FAILED;
    request.save();
    throw error;
  }
}

async function getResult(images, requestId, userId) {
  try {
    const folderPath = path.join(defaultStorageDir, requestId);
    const newFolder = fs.mkdirSync(folderPath, { recursive: true });
    for (let i = 0; i < images.length; i++) {
      const imageData = images[i].data.data;
      const imageBuffer = Buffer.from(imageData);
      // *******the name of image must be change after integrating the processor
      const imageName = images[i].name;
      const filename = `${i}`;
      const filePath = path.join(defaultStorageDir, requestId, filename);
      const writedFile = fs.writeFile(filePath, imageBuffer, (err) => {
        if (err) {
          throw err;
        }
      });
    }
    const result = await resultDataTable.create({
      request_id: requestId,
      user_id: userId,
      folder_path: folderPath,
    });
    const request = await requestLogTable.findOne({
      where: {
        request_code: requestId,
      },
    });
    request.job_status = JOB_STATUS.SUCCESS;
    request.save();
    console.log("file saved suceessfully");
    return request;
  } catch (error) {
    const request = await requestLogTable.findOne({
      where: {
        request_code: requestId,
      },
    });
    request.job_status = JOB_STATUS.FAILED;
    request.save();
    throw error;
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

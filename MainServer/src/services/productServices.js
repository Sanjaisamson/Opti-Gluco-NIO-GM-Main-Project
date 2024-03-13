const fs = require("fs");
const path = require("path");
const { ulid } = require("ulid");
const { cloudinary } = require("../databases/cloudinary");
const { productTable } = require("../model/productModel");
const { requestLogTable } = require("../model/requestLogModel");
const { resultDataTable } = require("../model/resultDataModel");
const { RECENT_DATA_CONSTANTS } = require("../constants/requestConstants");
const { defaultStorageDir } = require("../config/storagePath");
const {
  JOB_STATUS,
} = require("../../../Iot_server/src/constants/jobConstants");

async function registerProduct(userId, productId) {
  try {
    const product = await productTable.findOne({
      where: {
        user_id: userId,
      },
    });
    if (!product || product.length === 0) {
      await productTable.create({
        user_id: userId,
        product_code: productId,
      });
      return;
    }
  } catch (error) {
    throw error;
  }
}

async function removeProduct(userId) {
  try {
    const product = await productTable.findOne({
      where: {
        user_id: userId,
      },
    });
    if (!product || product.length === 0) {
      throw new Error("this user has no registered product");
    }
    await productTable.destroy({
      where: {
        user_id: userId,
      },
    });
    return;
  } catch (error) {
    throw error;
  }
}

async function listProducts(userId) {
  try {
    const products = await productTable.findAll({
      where: {
        user_id: userId,
      },
    });
    if (!products || products.length === 0) {
      return products;
    }
    return products;
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
      throw new Error(400, "no products found");
    }
    await requestLogTable.create({
      user_id: userId,
      product_code: product.product_code,
      request_code: requestId,
    });
    const requestData = JSON.stringify({
      productCode: product.product_code,
      requestId: requestId,
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
      throw new Error(400, "error in start job");
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
    const requestLog = await requestLogTable.findOne({
      where: {
        request_code: requestId,
      },
    });
    requestLog.job_id = jobId;
    requestLog.job_status = jobStatus;
    await requestLog.save();
    return requestLog;
  } catch (error) {
    throw error;
  }
}
async function updateStatus(requestId, jobStatus, jobId) {
  try {
    const requestLog = await requestLogTable.findOne({
      where: {
        request_code: requestId,
      },
    });
    requestLog.job_id = jobId;
    requestLog.job_status = jobStatus;
    await requestLog.save();
    return requestLog;
  } catch (error) {
    const requestLog = await requestLogTable.findOne({
      where: {
        request_code: requestId,
      },
    });
    requestLog.job_status = JOB_STATUS.FAILED;
    requestLog.save();
    throw error;
  }
}

async function processingResult(images, requestId, userId, productCode) {
  try {
    const folderPath = path.join(defaultStorageDir, requestId);
    fs.mkdirSync(folderPath, { recursive: true });
    for (let i = 0; i < images.length; i++) {
      const imageData = images[i].data.data;
      const imageBuffer = Buffer.from(imageData);
      // *******the name of image must be change after integrating the processor
      const imageName = images[i].name;
      const filename = `${i}`;
      const filePath = path.join(defaultStorageDir, requestId, filename);
      fs.writeFile(filePath, imageBuffer, (err) => {
        if (err) {
          throw err;
        }
      });
    }
    await resultDataTable.create({
      request_id: requestId,
      user_id: userId,
      product_code: productCode,
      folder_path: folderPath,
    });
    const requestLogResult = await requestLogTable.update(
      {
        job_status: JOB_STATUS.SUCCESS,
      },
      {
        where: {
          request_code: requestId,
        },
      }
    );
    console.log("file saved successfully.......");
    return requestLogResult;
  } catch (error) {
    await requestLogTable.update(
      {
        job_status: JOB_STATUS.FAILED,
      },
      {
        where: {
          request_code: requestId,
        },
      }
    );
    throw error;
  }
}

async function checkJobStatus(jobId, requestId) {
  try {
    const jobStatus = await requestLogTable.findOne({
      where: {
        request_code: requestId,
        job_id: jobId,
      },
    });
    return jobStatus;
  } catch (error) {
    throw error;
  }
}

async function listRecentReadings(userId, currentPage, itemsPerPage) {
  try {
    let status = RECENT_DATA_CONSTANTS.success;
    const products = await productTable.findOne({
      where: {
        user_id: userId,
      },
    });
    if (!products || products.length === 0) {
      throw new Error(400);
    }
    const recentReadings = await resultDataTable.findAll({
      where: {
        user_id: userId.toString(),
        product_code: products.product_code,
      },
    });
    if (!recentReadings || recentReadings.length === 0) {
      status = RECENT_DATA_CONSTANTS.failure;
      return status;
    }
    const totalRecords = recentReadings.length;
    const totalPages = Math.ceil(totalRecords / itemsPerPage);
    const offset = (currentPage - 1) * itemsPerPage;
    const paginatedReadings = recentReadings.slice(
      offset,
      offset + itemsPerPage
    );
    return {
      data: paginatedReadings,
      status: status,
      totalPages: totalPages,
      currentPage: currentPage,
      offset: offset,
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  registerProduct,
  removeProduct,
  initiateJob,
  updateJobData,
  updateStatus,
  processingResult,
  listProducts,
  checkJobStatus,
  listRecentReadings,
};

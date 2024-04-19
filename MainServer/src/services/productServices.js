const fs = require("fs");
const path = require("path");
const { ulid } = require("ulid");
const { cloudinary } = require("../databases/cloudinary");
const { productTable } = require("../model/productModel");
const { requestLogTable } = require("../model/requestLogModel");
const { resultDataTable } = require("../model/resultDataModel");
const { patientDataTable } = require("../model/patientDataModel");
const {
  RECENT_DATA_CONSTANTS,
  ARRAY_CONSTANTS,
  RESPONSE_STATUS_CONSTANTS,
  DUMMYDATA_CONSTANTS,
} = require("../constants/appConstants");
const { defaultStorageDir } = require("../config/storagePath");
const {
  JOB_STATUS,
} = require("../../../Iot_server/src/constants/jobConstants");
const {
  sysConfig,
  deviceConfig,
  mlServerConfig,
} = require("../config/sysConfig");
const { userTable } = require("../model/userModel");
async function registerProduct(userId, productId) {
  try {
    console.log("data is here ", userId, productId);
    const product = await productTable.findOne({
      where: {
        user_id: userId,
      },
    });
    if (!product || product.length === ARRAY_CONSTANTS.LENGTH_ZERO) {
      await productTable.create({
        user_id: userId,
        product_code: productId,
      });
      const requestData = JSON.stringify({
        productCode: productId,
        url: sysConfig.system_url,
        userId: userId,
      });
      const response = await fetch(
        `http://${deviceConfig.device_host}/client/register-client`, // 192.168.1.14:3500 ${deviceConfig.device_host}
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(requestData),
          },
          body: requestData,
        }
      );
      if (response.status != 200) {
        throw new Error(
          RESPONSE_STATUS_CONSTANTS.FAILED,
          "error in register the client"
        );
      }
      return;
    } else if (
      product.product_code === productId &&
      product.user_id === userId
    ) {
      console.log("hioiiiii");
      const requestData = JSON.stringify({
        productCode: productId,
        url: sysConfig.system_url,
        userId: userId,
      });
      console.log("data for request", requestData);
      const response = await fetch(
        `http://${deviceConfig.device_host}/client/register-client`, // 192.168.1.14:3500
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(requestData),
          },
          body: requestData,
        }
      );
      console.log(response);
      if (response.status != 200) {
        throw new Error(
          RESPONSE_STATUS_CONSTANTS.FAILED,
          "error in register the client"
        );
      }
      return;
    }
    throw new Error(
      RESPONSE_STATUS_CONSTANTS.FAILED,
      "error in register the product"
    );
  } catch (error) {
    console.log("error is this ", error);
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
    if (!product || product.length === ARRAY_CONSTANTS.LENGTH_ZERO) {
      throw new Error(
        RESPONSE_STATUS_CONSTANTS.FAILED,
        "this user has no registered product"
      );
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
    if (!products || products.length === ARRAY_CONSTANTS.LENGTH_ZERO) {
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
    if (!product || product.length === ARRAY_CONSTANTS.LENGTH_ZERO) {
      throw new Error(RESPONSE_STATUS_CONSTANTS.FAILED, "no products found");
    }
    await requestLogTable.create({
      user_id: userId,
      product_code: product.product_code,
      request_code: requestId,
    });
    console.log("error at request", product.product_code);
    const requestData = JSON.stringify({
      productCode: product.product_code,
      requestId: requestId,
      userId: userId,
    });
    const response = await fetch(
      `http://${deviceConfig.device_host}/client/start-job`,
      {
        //http://192.168.1.14:3500/client/start-job
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestData),
        },
        body: requestData,
      }
    );
    console.log("heelloooo");
    console.log(response);
    if (!response.ok) {
      throw new Error(RESPONSE_STATUS_CONSTANTS.FAILED, "error in start job");
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
    console.log(
      "update status data reached services",
      requestId,
      jobStatus,
      jobId
    );
    const requestLog = await requestLogTable.findOne({
      where: {
        request_code: requestId,
      },
    });
    requestLog.job_id = jobId;
    requestLog.job_status = jobStatus;
    await requestLog.save();
    return;
  } catch (error) {
    console.log("Sorry failed to update status !!!");
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

async function saveFileOnStorage(images, requestId, userId, productCode) {
  try {
    const resultArray = [];
    const folderPath = path.join(defaultStorageDir, requestId);
    fs.mkdirSync(folderPath, { recursive: true });
    for (let i = 0; i < images.length; i++) {
      const imageData = images[i].data;
      const imageBuffer = Buffer.from(imageData);
      const imageName = images[i].name;
      const filename = `${i}`;
      const filePath = path.join(defaultStorageDir, requestId, filename);
      fs.writeFile(filePath, imageBuffer, (err) => {
        if (err) {
          throw err;
        }
      });
      const inference = await takeMlInfernce(
        imageBuffer,
        requestId,
        userId,
        productCode,
        folderPath
      );
      resultArray.push(inference);
    }
    return resultArray;
  } catch (error) {
    throw error;
  }
}

async function takeMlInfernce(
  imageBuffer,
  requestId,
  userId,
  productCode,
  folderPath
) {
  try {
    const requestData = JSON.stringify({
      bufferdata: imageBuffer,
    });
    const response = await fetch(
      `http://${mlServerConfig.ml_server_host}/predict`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestData),
        },
        body: requestData,
      }
    );
    if (!response.ok) {
      throw new Error(
        RESPONSE_STATUS_CONSTANTS.FAILED,
        "error in sending image for ml inference"
      );
    }
    const resultCategory = await response.json();
    await resultDataTable.create({
      request_id: requestId,
      user_id: userId,
      product_code: productCode,
      folder_path: folderPath,
      result_value: resultCategory,
    });
    return resultCategory;
  } catch (error) {
    throw error;
  }
}

async function processingResult(images, requestId, userId, productCode) {
  try {
    const processedImageResults = await saveFileOnStorage(
      images,
      requestId,
      userId,
      productCode
    );
    console.log("file processed successfully.......", processedImageResults);

    const rangeCounts = {};
    let mostFrequentRange = null;
    let maxCount = 0;
    console.log("loop started for get category");
    for (let i = 0; i < processedImageResults.length; i++) {
      const currentRange = processedImageResults[i];
      rangeCounts[currentRange] = (rangeCounts[currentRange] || 0) + 1;

      if (rangeCounts[currentRange] > maxCount) {
        maxCount = rangeCounts[currentRange];
        mostFrequentRange = currentRange;
      }
    }
    console.log("loop ended");
    console.log(
      "Final sugar category:",
      mostFrequentRange,
      "with",
      maxCount,
      "occurrences"
    );
    const requestLogResult = await requestLogTable.update(
      {
        job_status: JOB_STATUS.SUCCESS,
        final_result: mostFrequentRange,
      },
      {
        where: {
          request_code: requestId,
        },
      }
    );
    await patientDataTable.update(
      {
        last_sugar_level: mostFrequentRange,
      },
      {
        where: {
          user_id: userId,
        },
      }
    );
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
    let status = RECENT_DATA_CONSTANTS.SUCCESS;
    const products = await productTable.findOne({
      where: {
        user_id: userId,
      },
    });
    if (!products || products.length === ARRAY_CONSTANTS.LENGTH_ZERO) {
      throw new Error(RESPONSE_STATUS_CONSTANTS.FAILED);
    }
    const recentReadings = await requestLogTable.findAll({
      where: {
        user_id: userId.toString(),
        product_code: products.product_code,
      },
      order: [["createdAt", "ASC"]],
    });

    if (
      !recentReadings ||
      recentReadings.length === ARRAY_CONSTANTS.LENGTH_ZERO
    ) {
      status = RECENT_DATA_CONSTANTS.FAILED;
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
async function addReferenceValue(userId, referenceValue, readingId) {
  try {
    const correspondReading = await resultDataTable.findOne({
      where: {
        result_id: readingId,
      },
    });
    if (
      !correspondReading ||
      correspondReading.length === ARRAY_CONSTANTS.LENGTH_ZERO
    ) {
      throw new Error(RESPONSE_STATUS_CONSTANTS.FAILED);
    }
    correspondReading.refrence_value = referenceValue;
    await correspondReading.save();
    return;
  } catch (error) {
    throw error;
  }
}

async function getFinalResult(userId, requestId) {
  try {
    console.log(userId, requestId);
    const resultInfo = await requestLogTable.findOne({
      where: {
        request_code: requestId,
      },
    });
    console.log("result info...", resultInfo);
    return resultInfo;
  } catch (error) {
    throw error;
  }
}

async function setPatientData(
  userId,
  A1cValue,
  familyHealthData,
  fastingStatus,
  lastFoodTime,
  bloodPressure
) {
  try {
    const patientData = await patientDataTable.findOne({
      where: {
        user_id: userId,
      },
    });
    if (!patientData || patientData.length === ARRAY_CONSTANTS.LENGTH_ZERO) {
      await patientDataTable.create({
        user_id: userId,
        A1c_value: A1cValue,
        fasting_status: fastingStatus,
        last_food_time: lastFoodTime,
        family_health_data: familyHealthData,
        blood_pressure: bloodPressure,
      });
    }
    const patientdata = await patientDataTable.update(
      {
        A1c_value: A1cValue,
        fasting_status: fastingStatus,
        last_food_time: lastFoodTime,
        family_health_data: familyHealthData,
        blood_pressure: bloodPressure,
      },
      {
        where: {
          user_id: userId,
        },
      }
    );
  } catch (error) {
    throw error;
  }
}

async function predictDiabaticChance(userId) {
  console.log("call for prediction is at service");
  let diabaticChanceStatus = null;
  try {
    const patientData = await patientDataTable.findOne({
      where: {
        user_id: userId,
      },
    });
    const userData = await userTable.findOne({
      where: {
        user_id: userId,
      },
    });
    console.log(patientData);
    if (
      patientData.A1c_value <= 5.7 &&
      patientData.last_sugar_level != "111-125"
    ) {
      diabaticChanceStatus = "normal";
    } else if (
      5.7 < patientData.A1c_value <= 6.4 &&
      patientData.last_sugar_level != "85-95"
    ) {
      diabaticChanceStatus = "Pre Diabatic";
    } else if (
      patientData.A1c_value >= 6.5 &&
      patientData.last_sugar_level == "111-125"
    ) {
      diabaticChanceStatus = "Diabatic";
    } else {
      diabaticChanceStatus = null;
    }
    console.log(patientData.user_id, userData.user_age, diabaticChanceStatus);

    return diabaticChanceStatus;
  } catch (error) {
    throw error;
  }
}

async function getChartData(userId) {
  try {
    console.log("request for chart data", userId);
    const products = await productTable.findOne({
      where: {
        user_id: userId,
      },
    });
    if (!products || products.length === ARRAY_CONSTANTS.LENGTH_ZERO) {
      throw new Error(RESPONSE_STATUS_CONSTANTS.FAILED);
    }
    const recentReadings = await requestLogTable.findAll({
      where: {
        user_id: userId.toString(),
        product_code: products.product_code,
      },
      order: [["createdAt", "ASC"]],
      limit: 5,
    });
    console.log(recentReadings);
    return recentReadings;
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
  addReferenceValue,
  getFinalResult,
  setPatientData,
  predictDiabaticChance,
  getChartData,
};

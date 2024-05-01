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
      const requestData = JSON.stringify({
        productCode: productId,
        url: sysConfig.system_url,
        userId: userId,
      });
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
    const requestData = JSON.stringify({
      productCode: product.product_code,
      requestId: requestId,
      userId: userId,
    });
    const response = await fetch(
      `http://${deviceConfig.device_host}/client/start-job`,
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
      `http://${mlServerConfig.ml_server_host}/sugar-level`,
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
    for (let i = 0; i < processedImageResults.length; i++) {
      const currentRange = processedImageResults[i];
      rangeCounts[currentRange] = (rangeCounts[currentRange] || 0) + 1;

      if (rangeCounts[currentRange] > maxCount) {
        maxCount = rangeCounts[currentRange];
        mostFrequentRange = currentRange;
      }
    }
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

async function checkJobStatus(requestId) {
  try {
    const jobStatus = await requestLogTable.findOne({
      where: {
        request_code: requestId,
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

async function predictDiabaticChance(userId) {
  let diabaticChanceStatus = null;
  let genderValue = null;
  let sugarValue = null;
  try {
    console.log("call reched at predict data service ");
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
    if (userData.user_gender === "male") {
      genderValue = "1";
    } else if (userData.user_gender === "female") {
      genderValue = "0";
    } else {
      genderValue = "2";
    }
    if (patientData.last_sugar_level === "85-95") {
      sugarValue = "0";
    } else if (patientData.last_sugar_level === "96-110") {
      sugarValue = "1";
    } else if (patientData.last_sugar_level === "111-125") {
      sugarValue = "2";
    } else {
      sugarValue = "3";
    }
    const requestData = JSON.stringify({
      gender: genderValue,
      age: userData.user_age,
      hypertension_status: patientData.hypertension_status,
      heartdisease_status: patientData.heartdisease_status,
      smoking_status: patientData.smoking_status,
      height: patientData.height,
      weight: patientData.weight,
      BMI_Value: patientData.BMI_Value,
      HbA1c: patientData.HbA1c,
      sugar_level: sugarValue,
    });
    console.log(requestData);
    const response = await fetch(
      `http://${mlServerConfig.ml_server_host}/prediction`,
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
    const result = await response.json();
    console.log("prediction result", result);
    if (result === 1 && patientData.HbA1c >= 6.5) {
      diabaticChanceStatus = "Diabatic";
    } else if (result === 0 && patientData.HbA1c >= 6.5) {
      diabaticChanceStatus = "Diabatic";
    } else if (result === 1 && 5.7 < patientData.HbA1c <= 6.4) {
      diabaticChanceStatus = "Pre Diabatic";
    } else if (result === 0 && patientData.HbA1c <= 5.4) {
      diabaticChanceStatus = "normal";
    }
    return diabaticChanceStatus;
  } catch (error) {
    throw error;
  }
}

async function setPatientData(
  userId,
  genderValue,
  age,
  hypertensionValue,
  heartdiseaseValue,
  smokingHistoryValue,
  height,
  weight,
  BMI_Value,
  HbA1c_Value
) {
  try {
    const patientData = await patientDataTable.findOne({
      where: {
        user_id: userId,
      },
    });
    console.log("patient data", patientData);
    if (!patientData || patientData.length === ARRAY_CONSTANTS.LENGTH_ZERO) {
      await patientDataTable.create({
        user_id: userId,
        hypertension_status: hypertensionValue,
        heartdisease_status: heartdiseaseValue,
        smoking_status: smokingHistoryValue,
        height: height,
        weight: weight,
        BMI_Value: BMI_Value,
        HbA1c: HbA1c_Value,
      });
      return;
    } else {
      console.log("updating");
      const patientdata = await patientDataTable.update(
        {
          hypertension_status: hypertensionValue,
          heartdisease_status: heartdiseaseValue,
          smoking_status: smokingHistoryValue,
          height: height,
          weight: weight,
          BMI_Value: BMI_Value,
          HbA1c: HbA1c_Value,
        },
        {
          where: {
            user_id: userId,
          },
        }
      );
      return;
    }
  } catch (error) {
    throw error;
  }
}

async function getChartData(userId) {
  try {
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

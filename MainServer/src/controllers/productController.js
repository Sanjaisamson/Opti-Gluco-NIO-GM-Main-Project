const httpErrors = require("http-errors");
const productServices = require("../services/productServices");
const {
  RECENT_DATA_CONSTANTS,
  RESPONSE_STATUS_CONSTANTS,
} = require("../constants/appConstants");

async function registerProduct(req, res) {
  try {
    console.log("call for register product");
    const userId = req.user.user_id;
    const productId = req.body.productCode;
    await productServices.registerProduct(userId, productId);
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SUCCESS);
  } catch (error) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function removeProduct(req, res) {
  try {
    console.log("call for remove product");
    await productServices.removeProduct(req.user.user_id);
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SUCCESS);
  } catch (error) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function listProducts(req, res) {
  try {
    console.log("call for list product....");
    const listProductResponse = await productServices.listProducts(
      req.user.user_id
    );
    return res
      .status(RESPONSE_STATUS_CONSTANTS.SUCCESS)
      .json(listProductResponse);
  } catch (error) {
    return res.status(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function initiateJob(req, res) {
  try {
    console.log("call for initiate job....");
    const initiateJobResponse = await productServices.initiateJob(
      req.user.user_id
    );
    await productServices.updateJobData(
      initiateJobResponse.jobId,
      initiateJobResponse.jobStatus,
      initiateJobResponse.requestId
    );
    return res
      .status(RESPONSE_STATUS_CONSTANTS.SUCCESS)
      .json(initiateJobResponse);
  } catch (error) {
    return res.status(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function updateStatus(req, res) {
  try {
    console.log("call for update status.....");
    const { requestId, jobStatus, jobId } = req.body;
    await productServices.updateStatus(requestId, jobStatus, jobId);
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SUCCESS);
  } catch (error) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}
async function processingResult(req, res) {
  try {
    console.log("call for prosessing result");
    const { images, requestId, userId, productCode } = req.body;
    const processingResultResponse = await productServices.processingResult(
      images,
      requestId,
      userId,
      productCode
    );
    return res.send(processingResultResponse);
  } catch (error) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function checkJobStatus(req, res) {
  try {
    const { requestId } = req.body;
    console.log("call for checker");
    const statusResponse = await productServices.checkJobStatus(requestId);
    console.log("checker responded");
    return res.status(RESPONSE_STATUS_CONSTANTS.SUCCESS).json(statusResponse);
  } catch (error) {
    console.log("error in check status", error);
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function listRecentReadings(req, res) {
  try {
    const recentReadingsResponse = await productServices.listRecentReadings(
      req.user.user_id,
      req.body.currentPage,
      req.body.itemsPerPage
    );
    if (recentReadingsResponse.status === RECENT_DATA_CONSTANTS.SUCCESS) {
      return res.send(recentReadingsResponse);
    }
  } catch (error) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function addReferenceValue(req, res) {
  try {
    const addRefernceResponse = await productServices.addReferenceValue(
      req.user.user_id,
      req.body.referenceValue,
      req.body.readingId
    );
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SUCCESS);
  } catch (error) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function getFinalResult(req, res) {
  try {
    const userId = req.user.user_id;
    const requestId = req.body.requestId;
    const resultInfo = await productServices.getFinalResult(userId, requestId);
    return res.status(RESPONSE_STATUS_CONSTANTS.SUCCESS).json(resultInfo);
  } catch (error) {
    return res.status(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function setPatientData(req, res) {
  try {
    const userId = req.user.user_id;
    const {
      A1cValue,
      fastingStatus,
      lastFoodTime,
      familyHealthData,
      bloodPressure,
    } = req.body;
    const resultInfo = await productServices.setPatientData(
      userId,
      A1cValue,
      familyHealthData,
      fastingStatus,
      lastFoodTime,
      bloodPressure
    );
    return res.status(RESPONSE_STATUS_CONSTANTS.SUCCESS).json(resultInfo);
  } catch (error) {
    return res.status(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function predictDiabaticChance(req, res) {
  try {
    const userId = req.user.user_id;
    console.log("call for predictDiabaticChance");
    const diabaticChance = await productServices.predictDiabaticChance(userId);
    return res.status(RESPONSE_STATUS_CONSTANTS.SUCCESS).json(diabaticChance);
  } catch (error) {
    return res.status(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function getChartData(req, res) {
  try {
    console.log("call for chart data");
    const userId = req.user.user_id;
    const chartData = await productServices.getChartData(userId);
    return res.status(RESPONSE_STATUS_CONSTANTS.SUCCESS).json(chartData);
  } catch (error) {
    return res.status(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

module.exports = {
  registerProduct,
  removeProduct,
  initiateJob,
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

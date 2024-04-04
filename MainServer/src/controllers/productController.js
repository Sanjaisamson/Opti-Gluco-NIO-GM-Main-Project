const httpErrors = require("http-errors");
const productServices = require("../services/productServices");
const {
  RECENT_DATA_CONSTANTS,
  RESPONSE_STATUS_CONSTANTS,
} = require("../constants/appConstants");

async function registerProduct(req, res) {
  try {
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
    await productServices.removeProduct(req.user.user_id);
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SUCCESS);
  } catch (error) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function listProducts(req, res) {
  try {
    const listProductResponse = await productServices.listProducts(
      req.user.user_id
    );
    return res.send(listProductResponse);
  } catch (error) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function initiateJob(req, res) {
  try {
    const initiateJobResponse = await productServices.initiateJob(
      req.user.user_id
    );
    await productServices.updateJobData(
      initiateJobResponse.jobId,
      initiateJobResponse.jobStatus,
      initiateJobResponse.requestId
    );
    return res.send(initiateJobResponse);
  } catch (error) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}

async function updateStatus(req, res) {
  try {
    const { requestId, jobStatus, jobId } = req.body;
    console.log("data reached at controller for update status");
    await productServices.updateStatus(requestId, jobStatus, jobId);
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SUCCESS);
  } catch (error) {
    console.log("Sorry!!! failed to update status : from controller");
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.FAILED);
  }
}
async function processingResult(req, res) {
  try {
    console.log("request reached here", req.body);
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
    const { jobId, requestId } = req.body;
    const statusResponse = await productServices.checkJobStatus(
      jobId,
      requestId
    );

    return res.send(statusResponse);
  } catch (error) {
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
};

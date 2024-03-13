const httpErrors = require("http-errors");
const productServices = require("../services/productServices");
const { RECENT_DATA_CONSTANTS } = require("../constants/requestConstants");

async function registerProduct(req, res) {
  try {
    const userId = req.user.user_id;
    const productId = req.body.productCode;
    await productServices.registerProduct(userId, productId);
    return res.sendStatus(200);
  } catch (error) {
    const productRegistrationError = httpErrors(
      400,
      "This user cant register a product!!"
    );
    return res.send(productRegistrationError);
  }
}

async function removeProduct(req, res) {
  try {
    await productServices.removeProduct(req.user.user_id);
    return res.sendStatus(200);
  } catch (error) {
    const productRemoveError = httpErrors(
      400,
      "This user cant remove product!!"
    );
    return res.send(productRemoveError);
  }
}

async function listProducts(req, res) {
  try {
    const listProductResponse = await productServices.listProducts(
      req.user.user_id
    );
    return res.send(listProductResponse);
  } catch (error) {
    const listProductError = httpErrors(400, "product Listing error");
    return res.send(listProductError);
  }
}

async function initiateJob(req, res) {
  try {
    const initiateJobResponse = await productServices.initiateJob(
      req.user.user_id
    );
    await productServices.updateJobData(
      newJob.jobId,
      newJob.jobStatus,
      newJob.requestId
    );
    return res.send(initiateJobResponse);
  } catch (error) {
    const initiateJobError = httpErrors(400, "This user cant initiate job!!");
    return res.send(initiateJobError);
  }
}

async function updateStatus(req, res) {
  try {
    const { requestId, jobStatus, jobId } = req.body;
    const updateStatusResponse = await productServices.updateStatus(
      requestId,
      jobStatus,
      jobId
    );
    return updateStatusResponse;
  } catch (error) {
    const updateStatusError = httpErrors(
      400,
      "This user cant remove product!!"
    );
    return res.send(updateStatusError);
  }
}
async function processingResult(req, res) {
  try {
    const { images, requestId, userId } = req.body;
    const processingResultResponse = await productServices.processingResult(
      images,
      requestId,
      userId
    );
    return res.send(processingResultResponse);
  } catch (error) {
    const processingResultError = httpErrors(
      400,
      "This user cant remove product!!"
    );
    return res.send(processingResultError);
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
    const checkStatusError = httpErrors(400, "This user cant remove product!!");
    return res.send(checkStatusError);
  }
}

async function listRecentReadings(req, res) {
  try {
    const recentReadingsResponse = await productServices.listRecentReadings(
      req.user.user_id,
      req.body.currentPage,
      req.body.itemsPerPage
    );
    if (recentReadingsResponse.status === RECENT_DATA_CONSTANTS.success) {
      return res.send({ data: recentReadingsResponse });
    }
  } catch (error) {
    const recentreadingsError = httpErrors(
      400,
      "This user cant List recent data"
    );
    return res.send(recentreadingsError);
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
};

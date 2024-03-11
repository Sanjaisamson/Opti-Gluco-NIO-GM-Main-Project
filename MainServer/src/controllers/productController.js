const httpErrors = require("http-errors");
const productServices = require("../services/productServices");
const {
  READ_DATA_CONSTANTS,
  RECENT_DATA_CONSTANTS,
} = require("../constants/requestConstants");

async function registerProduct(req, res, next) {
  try {
    const userId = req.user.user_id;
    const productCode = req.body.productCode;
    const registeredProduct = await productServices.registerProduct(
      userId,
      productCode
    );
    return res.send(registeredProduct);
  } catch (error) {
    const productRegistrationError = httpErrors(
      400,
      "This user cant register a product!!"
    );
    return res.sendStatus(400);
  }
}

async function removeProduct(req, res, next) {
  try {
    const userId = req.user.user_id;
    const removedProduct = await productServices.removeProduct(userId);
    return res.send({ removedProduct });
  } catch (error) {
    const productremoveError = httpErrors(
      400,
      "This user cant remove product!!"
    );
    return res.send(productremoveError);
  }
}

async function listProducts(req, res, next) {
  try {
    const products = await productServices.listProducts(req.user.user_id);
    return res.send(products);
  } catch (error) {
    const listingProductError = httpErrors(400, "product Listingerror");
    return res.send(listingProductError);
  }
}

async function initiateJob(req, res, next) {
  try {
    const newJob = await productServices.initiateJob(req.user.user_id);
    if (newJob === null) {
      return res.sendStatus(404);
    }
    const updateJobData = await productServices.updateJobData(
      newJob.jobId,
      newJob.jobStatus,
      newJob.requestId
    );
    return res.send(newJob);
  } catch (error) {
    const initiateJobError = httpErrors(400, "This user cant initiate job!!");
    return res.send(initiateJobError);
  }
}

async function updatestatus(req, res, next) {
  try {
    const { requestId, jobStatus, jobId } = req.body;
    const updatedStatus = await productServices.updateStatus(
      requestId,
      jobStatus,
      jobId
    );
    return updatedStatus;
  } catch (error) {
    const updateStatusError = httpErrors(
      400,
      "This user cant remove product!!"
    );
    return res.send(updateStatusError);
  }
}
async function processingResult(req, res, next) {
  try {
    const { images, requestId, userId } = req.body;
    const result = await productServices.processingResult(
      images,
      requestId,
      userId
    );
    return res.send(result);
  } catch (error) {
    const resultProcessingError = httpErrors(
      400,
      "This user cant remove product!!"
    );
    return res.send(resultProcessingError);
  }
}

async function checkJobStatus(req, res, next) {
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
    console.log("request at controller");
    const recentReadings = await productServices.listRecentReadings(
      req.user.user_id,
      req.body.currentPage,
      req.body.itemsPerPage
    );
    if (recentReadings.status === RECENT_DATA_CONSTANTS.success) {
      return res.send({ data: recentReadings });
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  registerProduct,
  removeProduct,
  initiateJob,
  updatestatus,
  processingResult,
  listProducts,
  checkJobStatus,
  listRecentReadings,
};

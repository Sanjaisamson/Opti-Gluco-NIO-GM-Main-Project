const httpErrors = require("http-errors");
const productServices = require("../services/productServices");

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
    next(productremoveError);
  }
}

async function listProducts(req, res, next) {
  try {
    const products = await productServices.listProducts(req.user.user_id);
    return res.send(products);
  } catch (error) {
    const productListError = httpErrors(401, "Product not found!!");
    next(productListError);
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
    throw error;
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
    throw error;
  }
}
async function getResult(req, res, next) {
  try {
    const { images, requestId, userId } = req.body;
    const result = await productServices.getResult(images, requestId, userId);
    return res.status(200).send(result);
  } catch (error) {
    throw error;
  }
}

async function checkJobStatus(req, res, next) {
  try {
    const { jobId, requestId } = req.body;
    const statusResponse = await productServices.checkJobStatus(
      jobId,
      requestId
    );
    return res.status(200).send(statusResponse);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  registerProduct,
  removeProduct,
  initiateJob,
  updatestatus,
  getResult,
  listProducts,
  checkJobStatus,
};

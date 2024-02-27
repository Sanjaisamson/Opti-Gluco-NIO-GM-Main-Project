const httpErrors = require("http-errors");
const productServices = require("../services/productServices");

async function registerProduct(req, res, next) {
  try {
    const userId = req.user.user_id;
    const userName = req.user.user_name;
    const productCode = req.body.productCode;
    console.log(req.body);
    const data = { userId, userName, productCode };
    const registeredProduct = await productServices.registerProduct(data);
    return res.send(registeredProduct);
  } catch (error) {
    const productRegistrationError = httpErrors(
      400,
      "This user cant register a product!!"
    );
    next(productRegistrationError);
  }
}

async function removeProduct(req, res, next) {
  try {
    const userId = req.user.user_id;
    const removedProduct = await productServices.removeProduct(userId);
    return res.send(removedProduct);
  } catch (error) {
    const productremoveError = httpErrors(
      400,
      "This user cant remove product!!"
    );
    next(productremoveError);
  }
}

async function initiateJob(req, res, next) {
  try {
    const newJob = await productServices.initiateJob(req.user.user_id);
    const updateJobData = await productServices.updateJobData(
      newJob.jobId,
      newJob.jobStatus,
      newJob.requestId
    );
    return res.send({ newJob });
  } catch (error) {
    throw error;
  }
}

async function updatestatus(req, res, next) {
  try {
    const { requestCode, jobStatus } = req.body;
    const updatedStatus = await productServices.updateStatus(
      requestCode,
      jobStatus
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

module.exports = {
  registerProduct,
  removeProduct,
  initiateJob,
  updatestatus,
  getResult,
};

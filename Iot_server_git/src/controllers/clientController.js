const clientServices = require("../services/clientServices");
const { RESPONSE_STATUS_CONSTANTS } = require("../constants/jobConstants");
async function initiateJob(req, res) {
  try {
    const { userId, productCode, requestId, captureDelay, totalTime } =
      req.body;
    console.log("data at controller for reading");
    const initiateJobResponse = await clientServices.createJob(requestId);
    console.log("successfylly job initiated");
    clientServices.startJob(
      initiateJobResponse.jobId,
      requestId,
      userId,
      productCode
    );
    return res.send({
      jobId: initiateJobResponse.jobId,
      jobStatus: initiateJobResponse.jobStatus,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SERVER_ERROR);
  }
}

async function registerClient(req, res) {
  try {
    console.log("data at controller for register client");
    const { url, productCode, userId } = req.body;
    if (!url || !productCode || !userId) {
      throw new Error(400, "one of the data is missing");
    }
    await clientServices.registerClient(url, productCode, userId);
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SUCCESS);
  } catch (error) {
    console.log(error);
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SERVER_ERROR);
  }
}
module.exports = { initiateJob, registerClient };

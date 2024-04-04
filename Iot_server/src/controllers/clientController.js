const clientServices = require("../services/clientServices");
const { RESPONSE_STATUS_CONSTANTS } = require("../constants/jobConstants");
async function initiateJob(req, res) {
  try {
    const { userId, productCode, requestId, captureDelay, totalTime } =
      req.body;
    const initiateJobResponse = await clientServices.createJob(requestId);
    clientServices.executeCronjob(
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
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SERVER_ERROR);
  }
}

async function registerClient(req, res) {
  try {
    const { url, productCode, userId } = req.body;
    await clientServices.registerClient(url, productCode, userId);
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SUCCESS);
  } catch (error) {
    return res.sendStatus(RESPONSE_STATUS_CONSTANTS.SERVER_ERROR);
  }
}
module.exports = { initiateJob, registerClient };

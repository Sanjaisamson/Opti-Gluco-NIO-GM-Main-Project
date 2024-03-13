const clientServices = require("../services/clientServices");

async function initiateJob(req, res, next) {
  try {
    const { userId, productCode, requestId, captureDelay, totalTime } =
      req.body;
    const initiateJobResponse = await clientServices.createJob(requestId);
    clientServices.executeCronjob(initiateJobResponse.jobId, requestId, userId);
    return res.send({
      jobId: initiateJobResponse.jobId,
      jobStatus: initiateJobResponse.jobStatus,
    });
  } catch (error) {
    return res.sendStatus(500);
  }
}
module.exports = { initiateJob };

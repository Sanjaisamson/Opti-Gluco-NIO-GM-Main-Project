const clientServices = require("../services/clientServices");
const cron = require("node-cron");

async function initiateJob(req, res, next) {
  try {
    const { userId, productCode, requestCode, captureDelay, totalTime } =
      req.body;
    const newJob = await clientServices.createJob(productCode);
    res.send({ jobId: newJob.jobId, jobStatus: newJob.jobStatus });
    const { images, jobStatus } = await clientServices.executeCronjob(
      newJob.jobId,
      newJob.jobStatus,
      requestCode
    );
    const result = await clientServices.sendResult(
      images,
      requestCode,
      newJob.jobId,
      userId
    );
    return;
  } catch (error) {
    throw error;
  }
}
async function readData(req, res, next) {
  try {
    const updatedStatus = await clientServices.updateStatus(
      jobStatus,
      newJob.jobId
    );
    return res.send(images, newJob.jobId, updatedStatus.jobStatus);
  } catch (error) {
    throw error;
  }
}
module.exports = { readData, initiateJob };

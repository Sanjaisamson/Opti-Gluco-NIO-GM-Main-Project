const clientServices = require("../services/clientServices");
const cron = require("node-cron");

async function initiateJob(req, res, next) {
  try {
    const { userId, productCode, requestCode, captureDelay, totalTime } =
      req.body;
    const newJob = await clientServices.createJob(productCode);
    const { images } = clientServices.executeCronjob(
      newJob.jobId,
      newJob.jobStatus,
      requestCode,
      userId
    );
    return res.send({ jobId: newJob.jobId, jobStatus: newJob.jobStatus });
  } catch (error) {
    throw error;
  }
}
module.exports = { initiateJob };

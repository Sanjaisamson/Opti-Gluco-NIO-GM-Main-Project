const clientServices = require("../services/clientServices");
const cron = require("node-cron");

async function readData(req, res, next) {
  try {
    const { user_id, product_code, requestId, captureDelay, totalTime } =
      req.body;
    const { job_id, job_status } = await clientServices.createJob(product_code);
    let { images, jobStatus } = await clientServices.executeCronjob(
      job_id,
      job_status,
      requestId
    );
    if (jobStatus === "failed" && images.length < 15) {
      throw new Error(500, "Internal error");
    }
    const updatedStatus = await clientServices.updateStatus(jobStatus, job_id);
    console.log("job finished successfully");
    return res.send(images);
  } catch (error) {
    throw error;
  }
}
async function checkstatus(req, res, next) {
  try {
    const job_id = req.body.job_id;
    const clientService = await clientServices.checkStatus(job_id);
    return res.send({ currentStatus: clientService.currentStatus });
  } catch (error) {
    throw error;
  }
}

module.exports = { readData, checkstatus };

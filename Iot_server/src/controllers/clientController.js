const { JOB_STATUS, DUMMY_DATA } = require("../constants/jobConstants");
const { jobStatusTable } = require("../models/jobStatusModel");
const clientServices = require("../services/clientServices");
const cron = require("node-cron");

async function initiateJob(req, res, next) {
  try {
    const { userId, productCode, requestId, captureDelay, totalTime } =
      req.body;
    const newJob = await clientServices.createJob(requestId);
    const { images } = clientServices.executeCronjob(
      newJob.jobId,
      newJob.jobStatus,
      requestId,
      userId
    );
    return res.send({ jobId: newJob.jobId, jobStatus: newJob.jobStatus });
  } catch (error) {
    const { requestId } = req.body;
    const dummyJobStatus = JOB_STATUS.FAILED;
    const dummyJobId = DUMMY_DATA.job_id;
    const updateStatusOnServer = await clientServices.updateStatusOnServer(
      dummyJobId,
      dummyJobStatus,
      requestId
    );
  }
}
module.exports = { initiateJob };

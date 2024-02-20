const e = require("express");
const clientServices = require("../services/clientServices");

async function readData(req, res, next) {
  try {
    const userId = req.body.user_id;
    const productId = req.body.product_id;
    const payload = { userId, productId };
    const { job_id, job_status } = await clientServices.createJob(payload);
    res.send({ job_id: job_id, status: job_status });
    const clientService = await clientServices.readData(job_id, job_status);
    console.log(clientService);
    return { clientService };
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

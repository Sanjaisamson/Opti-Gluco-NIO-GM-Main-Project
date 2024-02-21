const { ulid } = require("ulid");
const http = require("http");
const fs = require("fs");
require("dotenv").config();
const { exec } = require("child_process");
const { jobStatusTable } = require("../models/jobStatusModel");
const { jobDataTable } = require("../models/jobDataModel");
const cron = require("node-cron");
const { resolve } = require("path");
const { rejects } = require("assert");

async function createJob(product_code) {
  try {
    let jobId;
    let jobStatus;
    console.log("service level bare", product_code);
    console.log("service level env", process.env.PRODUCT_CODE);
    if (product_code === process.env.PRODUCT_CODE) {
      jobId = ulid();
      jobStatus = "job Initiated";
    } else {
      jobStatus = "failed";
      throw new Error(400, "product_id not matching !!!");
    }
    const newJob = await jobStatusTable.create({
      job_id: jobId,
      job_status: jobStatus,
    });
    return { job_id: newJob.job_id, job_status: newJob.job_status };
  } catch (error) {
    throw error;
  }
}
async function readData(job_id, jobStatus, requestId) {
  return new Promise(async (resolve, rejects) => {
    try {
      const filename =
        "C:\\Users\\SANJAI\\OneDrive\\Documents\\Main_Project\\dummy_data\\bg picture - Copy - Copy.jpg"; //`image${i}.jpg`
      const fileData = fs.readFileSync(filename);
      jobStatus = "completed";
      const jobLog = await jobDataTable.create({
        job_id: job_id,
        job_status: jobStatus,
        request_id: requestId,
        file_name: filename,
      });
      resolve({ job_id, jobStatus, filename, fileData });
    } catch (error) {
      console.log(error);
      job_status = "failed";
      console.log("service f1 catch level :", jobStatus);
      resolve({ jobStatus });
      throw error;
    }
  });
}
async function executeCronjob(job_id, jobStatus, requestId) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("service level before starting", jobStatus);
      let count = 0;
      const images = [];
      let cronJob = null;
      cronJob = cron.schedule("*/1 * * * * *", async () => {
        const data = await readData(job_id, jobStatus, requestId);
        count++;
        images.push({ name: data.filename, data: data.fileData });
        console.log(count);
        if (count >= 3) {
          console.log("service level after cronjob", data.jobStatus);
          cronJob && cronJob.stop();
          resolve({ images: images, jobStatus: data.jobStatus });
        }
      });
    } catch (error) {
      throw error;
    }
  });
}
async function updateStatus(jobStatus, jobId) {
  try {
    const job = await jobStatusTable.findOne({
      where: { job_id: jobId },
    });
    job.job_status = jobStatus;
    await job.save();
  } catch (error) {
    throw error(400, "error to update status");
  }
}
async function checkStatus(jobId) {
  try {
    const jobStatus = await jobStatusTable.findOne({
      where: {
        job_id: jobId,
      },
    });
    if (!jobStatus || jobStatus.length === 0) {
      throw new Error(500, "No job is existed for this Id");
    }
    const currentStatus = jobStatus.job_status;
    return { currentStatus };
  } catch (error) {
    throw error;
  }
}
module.exports = {
  createJob,
  readData,
  checkStatus,
  executeCronjob,
  updateStatus,
};

const { ulid } = require("ulid");
const http = require("http");
const fs = require("fs");
require("dotenv").config();
const { exec } = require("child_process");
const errorConstants = require("../constants/errorConstants");
const { JOB_STATUS, CRON_CONSTANTS } = require("../constants/jobConstants");
const { jobStatusTable } = require("../models/jobStatusModel");
const { jobDataTable } = require("../models/jobDataModel");
const { AppError, InternalError } = require("../ERROR/appError");
const cron = require("node-cron");
const { resolve } = require("path");
const { rejects } = require("assert");

async function createJob(productCode) {
  try {
    if (productCode === process.env.PRODUCT_CODE) {
      const jobId = ulid();
      const jobStatus = JOB_STATUS.INITIATED;
      const newJob = await jobStatusTable.create({
        job_id: jobId,
        job_status: jobStatus,
      });
      return { jobId, jobStatus };
    }
  } catch (error) {
    throw error;
  }
}
async function readData(jobId, jobStatus, requestId) {
  return new Promise(async (resolve, rejects) => {
    try {
      const filename =
        "C:\\Users\\SANJAI\\OneDrive\\Documents\\Main_Project\\dummy_data\\bg picture - Copy - Copy.jpg"; //`image${i}.jpg`
      const fileData = fs.readFileSync(filename);
      jobStatus = JOB_STATUS.PROGRESS;
      resolve({ jobId, jobStatus, filename, fileData, requestId });
    } catch (error) {
      rejects(error);
    }
  });
}
async function executeCronjob(jobId, jobStatus, requestId) {
  return new Promise(async (resolve, rejects) => {
    try {
      let count = 0;
      const images = [];
      let cronJob = null;
      let data;
      cronJob = cron.schedule(CRON_CONSTANTS.CRONE_JOB_INTERVAL, async () => {
        try {
          data = await readData(jobId, jobStatus, requestId);
        } catch (error) {
          cronJob.stop();
          const job = await jobStatusTable.findOne({
            where: { job_id: jobId },
          });
          job.job_status = JOB_STATUS.FAILED;
          await job.save();
          rejects(error);
        }
        count++;
        images.push({ name: data.filename, data: data.fileData });

        const jobLog = await jobDataTable.create({
          job_id: data.job_id,
          job_status: JOB_STATUS.SUCCESS,
          request_id: data.requestId,
          file_name: data.filename,
        });
        console.log(count);
        if (count >= CRON_CONSTANTS.JOB_COUNT) {
          cronJob && cronJob.stop();
          resolve({ images: images, jobStatus: data.jobStatus });
        }
        console.log("hai!!!!");
        const requestData = JSON.stringify({
          jobId: data.jobId,
          jobStatus: data.jobStatus,
          requestCode: requestId,
        });
        const response = await fetch(
          "http://localhost:3000/product/update-status",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(requestData),
            },
            body: requestData,
          }
        );
        if (!response.ok) {
          throw new Error("status updation Network response was not ok");
        }
        const updationReq = await response.json();
        console.log(updationReq);
      });
    } catch (error) {
      const job = await jobStatusTable.findOne({
        where: { job_id: jobId },
      });
      job.job_status = JOB_STATUS.FAILED;
      await job.save();
      rejects(error);
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
    return { jobStatus: job.job_status };
  } catch (error) {
    throw error;
  }
}
module.exports = {
  createJob,
  readData,
  executeCronjob,
  updateStatus,
};

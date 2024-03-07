const { ulid } = require("ulid");
const http = require("http");
const fs = require("fs");
require("dotenv").config();
const { exec } = require("child_process");
const errorConstants = require("../constants/errorConstants");
const {
  JOB_STATUS,
  CRON_CONSTANTS,
  DUMMY_DATA,
} = require("../constants/jobConstants");
const { jobStatusTable } = require("../models/jobStatusModel");
const { jobDataTable } = require("../models/jobDataModel");
const { AppError, InternalError } = require("../ERROR/appError");
const cron = require("node-cron");

async function createJob(requestId) {
  try {
    // if (productCode === process.env.PRODUCT_CODE) {
    const jobId = ulid();
    const jobStatus = JOB_STATUS.INITIATED;
    const newJob = await jobStatusTable.create({
      job_id: jobId,
      job_status: jobStatus,
      request_id: requestId,
    });
    return { jobId: newJob.job_id, jobStatus: newJob.job_status };
    // }
  } catch (error) {
    const newJob = await jobStatusTable.create({
      job_id: DUMMY_DATA.job_id,
      job_status: JOB_STATUS.FAILED,
      request_id: requestId,
    });
    throw error;
  }
}
async function readData(jobId, jobStatus, requestId, count) {
  return new Promise(async (resolve, rejects) => {
    try {
      const filename =
        "C:\\Users\\SANJAI\\OneDrive\\Documents\\Main_Project\\dummy_data\\bg picture - Copy - Copy.jpg"; // `image${count}.jpg`"C:\Users\SANJAI\OneDrive\Documents\Main_Project\dummy_data\bg picture - Copy - Copy.jpg"
      // const command = `raspistill -o ${filename} -tl 8000 -t 128000`;
      // exec(command, (error, stdout, stderr) => {
      //   if (error) {
      //     console.error(`Error capturing images: ${error.message}`);
      //     rejects(new Error(`Error capturing images: ${error.message}`));
      //     return;
      //   }
      //   if (stderr) {
      //     console.error(`Error capturing images: ${stderr}`);
      //     rejects(new Error(`Error capturing images: ${stderr}`));
      //     return;
      //   }
      //   console.log("Images captured successfully...");
      //   const fileData = fs.readFileSync(filename);
      //   const jobStatus = JOB_STATUS.PROGRESS;
      //   ;
      // });
      console.log("Images captured successfully...");
      const fileData = fs.readFileSync(filename);
      const jobStatus = JOB_STATUS.PROGRESS;
      resolve({ jobId, jobStatus, filename, fileData, requestId });
    } catch (error) {
      rejects(error);
    }
  });
}
async function executeCronjob(jobId, jobStatus, requestId, userId) {
  return new Promise(async (resolve, rejects) => {
    try {
      let count = 0;
      const images = [];
      let cronJob = null;
      let data;
      cronJob = cron.schedule(CRON_CONSTANTS.CRONE_JOB_INTERVAL, async () => {
        try {
          data = await readData(jobId, jobStatus, requestId, count);
        } catch (error) {
          cronJob.stop();
          const newjobStatus = JOB_STATUS.FAILED;
          const job = await jobStatusTable.findOne({
            where: { job_id: jobId },
          });
          job.job_status = JOB_STATUS.FAILED;
          await job.save();
          await updateStatusOnServer(jobId, newjobStatus, requestId);
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
          const result = await sendResult(images, requestId, jobId, userId);
          resolve({ images: images, jobStatus: data.jobStatus });
        }
      });
    } catch (error) {
      const job = await jobStatusTable.findOne({
        where: { job_id: jobId },
      });
      job.job_status = JOB_STATUS.FAILED;
      await job.save();
      await updateStatusOnServer(jobId, job.jobStatus, requestId);
    }
  });
}
async function updateStatusOnServer(jobId, jobStatus, requestId) {
  try {
    const requestData = JSON.stringify({
      jobId: jobId,
      jobStatus: jobStatus,
      requestId: requestId,
    });
    const response = await fetch("http:localhost:3000/product/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestData),
      },
      body: requestData,
    });
    if (!response.ok) {
      const job = await jobStatusTable.findOne({
        where: { job_id: jobId },
      });
      job.job_status = JOB_STATUS.FAILED;
      await job.save();
      throw new Error("status updation Network response was not ok");
    }
  } catch (error) {
    throw error;
  }
}

async function sendResult(images, requestId, jobId, userId) {
  try {
    const job = await jobStatusTable.findOne({
      where: { job_id: jobId },
    });
    job.job_status = JOB_STATUS.SUCCESS;
    await job.save();
    const requestData = JSON.stringify({
      userId: userId,
      jobStatus: JOB_STATUS.SUCCESS,
      requestId: requestId,
      images: images,
    });
    const response = await fetch("http:localhost:3000/product/results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestData),
      },
      body: requestData,
    });
    if (!response.ok) {
      const job = await jobStatusTable.findOne({
        where: { job_id: jobId },
      });
      job.job_status = JOB_STATUS.FAILED;
      await job.save();
      throw new Error("result sending  Network response was not ok");
    }
    return response;
  } catch (error) {
    const job = await jobStatusTable.findOne({
      where: { job_id: jobId },
    });
    job.job_status = JOB_STATUS.FAILED;
    await job.save();
    await updateStatusOnServer(jobId, job.jobStatus, requestId);
  }
}
module.exports = {
  createJob,
  readData,
  executeCronjob,
  updateStatusOnServer,
  sendResult,
};

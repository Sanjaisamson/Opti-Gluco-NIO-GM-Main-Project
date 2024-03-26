const fs = require("fs");
require("dotenv").config();
const { ulid } = require("ulid");
const cron = require("node-cron");
const { exec } = require("child_process");
const {
  JOB_STATUS,
  CRON_CONSTANTS,
  DUMMY_DATA,
  RESPONSE_STATUS_CONSTANTS,
} = require("../constants/jobConstants");
const { jobStatusTable } = require("../models/jobStatusModel");
const { jobDataTable } = require("../models/jobDataModel");
const { clientConfigTable } = require("../models/clientConfigModel");

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
    await jobStatusTable.create({
      job_id: DUMMY_DATA.job_id,
      job_status: JOB_STATUS.FAILED,
      request_id: requestId,
    });
    await updateStatusOnServer(DUMMY_DATA.job_id, JOB_STATUS.FAILED, requestId);
    throw error;
  }
}
async function readData(jobId, requestId) {
  return new Promise(async (resolve, rejects) => {
    try {
      const filename =
        "C:\\Users\\SANJAI\\OneDrive\\Documents\\Main_Project\\orginal_images\\85-95_original_image.jpg"; // `image${count}.jpg`"C:\Users\SANJAI\OneDrive\Documents\Main_Project\dummy_data\bg picture - Copy - Copy.jpg"
      // const command = `raspistill -o ${filename}%04d.jpg -tl 8000 -t 128000`;
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
async function executeCronjob(jobId, requestId, userId, productCode) {
  return new Promise(async (resolve, rejects) => {
    try {
      let count = 0;
      const images = [];
      let cronJob = null;
      let data;
      cronJob = cron.schedule(CRON_CONSTANTS.CRONE_JOB_INTERVAL, async () => {
        try {
          data = await readData(jobId, requestId);
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
        await jobDataTable.create({
          job_id: data.jobId,
          job_status: JOB_STATUS.SUCCESS,
          request_id: data.requestId,
          file_name: data.filename,
        });
        console.log(count);
        if (count >= CRON_CONSTANTS.JOB_COUNT) {
          cronJob && cronJob.stop();
          await sendResult(images, requestId, jobId, userId, productCode);
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
    const response = await fetch(
      "http://192.168.1.11:3000/product/update-status",
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
      const job = await jobStatusTable.findOne({
        where: { job_id: jobId },
      });
      job.job_status = JOB_STATUS.FAILED;
      await job.save();
      throw new Error(RESPONSE_STATUS_CONSTANTS.FAILED);
    }
    return response;
  } catch (error) {
    throw error;
  }
}

async function sendResult(images, requestId, jobId, userId, productCode) {
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
      productCode: productCode,
    });
    const response = await fetch("http://192.168.1.11:3000/product/results", {
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
      throw new Error(RESPONSE_STATUS_CONSTANTS.FAILED);
    }
    return response;
  } catch (error) {
    const job = await jobStatusTable.findOne({
      where: { job_id: jobId },
    });
    job.job_status = JOB_STATUS.FAILED;
    await job.save();
    await updateStatusOnServer(jobId, job.jobStatus, requestId);
    throw error;
  }
}
async function registerClient(url, productCode) {
  try {
    const client = await clientConfigTable.findOne({
      where: { product_code: productCode },
    });
    if (!client) {
      await clientConfigTable.create({
        product_code: productCode,
        client_url: url,
      });
      return;
    } else if (client.client_url != url) {
      client.client_url = url;
      await client.save();
      return;
    }
    return;
  } catch (error) {
    throw error;
  }
}
module.exports = {
  createJob,
  readData,
  executeCronjob,
  updateStatusOnServer,
  sendResult,
  registerClient,
};

const fs = require("fs");
const fsPromises = require("node:fs/promises");
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
const { defaultDir, homeDir } = require("../config/fileConfig");
const path = require("path");

async function createJob(requestId) {
  try {
    // if (productCode === process.env.PRODUCT_CODE) {
    console.log("data at create job service");
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
    console.log("error on create job service ", error);
    await jobStatusTable.create({
      job_id: DUMMY_DATA.job_id,
      job_status: JOB_STATUS.FAILED,
      request_id: requestId,
    });
    i;
    await updateStatusOnServer(DUMMY_DATA.job_id, JOB_STATUS.FAILED, requestId);
    throw error;
  }
}
async function readData(requestId, folder) {
  return new Promise(async (resolve, reject) => {
    try {
      const filename = `${folder}/${requestId}_image__`;
      const command = `raspistill -o ${filename}%04d.jpg -co 70 -br 70 -ISO 800 -w 640 -h 480 -t 120000 -tl 8000`;
      exec(command, (error) => {
        if (error) {
          console.log("Sorry !!! failed to capture images", error);
          reject(new Error(`Error capturing images: ${error.message}`));
          return;
        }
        console.log("Images captured successfully......");
        console.log("filepath is", filename);
        resolve();
      });
    } catch (error) {
      console.log("Sorry !!! failed to read data", error);
      reject(error);
    }
  });
}
async function deleteFolder(folder) {
  try {
    fs.rmdir(folder, { recursive: true }, (err) => {
      if (err) {
        throw new Error("failed to delete folder");
      }
      console.log(`${folder} is deleted!`);
    });
  } catch (error) {
    console.log("error for delete folder", error);
    throw error;
  }
}
async function executeCronjob(jobId, requestId, userId, productCode) {
  return new Promise(async (resolve, rejects) => {
    try {
      let count = 0;
      const images = [];
      let cronJob = null;
      let data;
      const folder = `${defaultDir.dir_name}_results`;
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {
          recursive: true,
        });
      }
      cronJob = cron.schedule(CRON_CONSTANTS.CRONE_JOB_INTERVAL, async () => {
        try {
          data = await readData(jobId, requestId, count, folder);
        } catch (error) {
          cronJob.stop();
          const newjobStatus = JOB_STATUS.FAILED;
          const job = await jobStatusTable.findOne({
            where: { job_id: jobId },
          });
          job.job_status = JOB_STATUS.FAILED;
          await job.save();
          await updateStatusOnServer(
            jobId,
            newjobStatus,
            requestId,
            productCode
          );
          throw new Error("Failed to execute");
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
          await deleteFolder(folder);
          resolve({ images: images, jobStatus: data.jobStatus });
        }
      });
    } catch (error) {
      console.log("error at execute cron job", error);
      const job = await jobStatusTable.findOne({
        where: { job_id: jobId },
      });
      job.job_status = JOB_STATUS.FAILED;
      await job.save();
      await updateStatusOnServer(
        jobId,
        JOB_STATUS.FAILED,
        requestId,
        productCode
      );
      rejects(error);
    }
  });
}

async function startJob(jobId, requestId, userId, productCode) {
  try {
    const images = [];
    const folder = `${defaultDir.dir_name}_${requestId}`;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, {
        recursive: true,
      });
    }
    const data = await readData(requestId, folder);
    const files = await fsPromises.readdir(folder);
    for (let i = 0; i < files.length; i++) {
      const filePath = `${folder}/${files[i]}`;
      const fileData = await fsPromises.readFile(filePath);
      images.push({ data: fileData });
      await jobDataTable.create({
        job_id: jobId,
        job_status: JOB_STATUS.SUCCESS,
        request_id: requestId,
        file_name: files[i],
      });
    }
    console.log("All files readed successfully.....");
    const controller = new AbortController();
    const timeout = 120000;
    const signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      await sendResult(images, requestId, userId, productCode, signal);
      clearTimeout(timeoutId);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.log("Abort Error!!!!");
        throw error;
      } else {
        throw error;
      }
    } finally {
      clearTimeout(timeoutId);
    }
    await deleteFolder(folder);
    const job = await jobStatusTable.findOne({
      where: { job_id: jobId },
    });
    job.job_status = JOB_STATUS.SUCCESS;
    await job.save();
    await updateStatusOnServer(
      jobId,
      JOB_STATUS.SUCCESS,
      requestId,
      productCode
    );
    return;
  } catch (error) {
    console.log("Sorry !!! failed to complete job", error);
    const job = await jobStatusTable.findOne({
      where: { job_id: jobId },
    });
    job.job_status = JOB_STATUS.FAILED;
    await job.save();
    await updateStatusOnServer(
      jobId,
      JOB_STATUS.FAILED,
      requestId,
      productCode
    );
    return;
  }
}
async function updateStatusOnServer(jobId, jobStatus, requestId, productCode) {
  try {
    console.log("data is at update status function");
    const client = await clientConfigTable.findOne({
      where: {
        product_id: productCode,
      },
    });
    const requestData = JSON.stringify({
      jobId: jobId,
      jobStatus: jobStatus,
      requestId: requestId,
    });
    console.log("request for update server is ready", requestData);
    const response = await fetch(
      `http://${client.client_url}/product/update-status`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestData),
        },
        body: requestData,
      }
    );
    if (response.status != RESPONSE_STATUS_CONSTANTS.SUCCESS) {
      throw new Error(RESPONSE_STATUS_CONSTANTS.FAILED);
    }
    console.log(
      "status is updated on main server with status code : ",
      response.status
    );
    return;
  } catch (error) {
    console.log("Sorry !!! failed to update status on main server", error);
    throw error;
  }
}

async function sendResult(images, requestId, userId, productCode, signal) {
  try {
    console.log("Data at send result function");
    const client = await clientConfigTable.findOne({
      where: {
        product_id: productCode,
      },
    });
    const requestData = JSON.stringify({
      userId: userId,
      jobStatus: JOB_STATUS.SUCCESS,
      requestId: requestId,
      images: images,
      productCode: productCode,
    });
    console.log("request data is ready for sending.......");
    const response = await fetch(
      `http://${client.client_url}/product/results`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestData),
        },
        body: requestData,
        signal, // Pass the AbortController signal
      }
    );
    console.log(
      "result sended successfully with status code:",
      response.status
    );
    if (response.status != RESPONSE_STATUS_CONSTANTS.SUCCESS) {
      console.log("sorry !!! failed to send result");
      throw new Error(RESPONSE_STATUS_CONSTANTS.FAILED);
    }
    return;
  } catch (error) {
    throw error;
  }
}
async function registerClient(url, productCode, userId) {
  try {
    console.log("data is at services for register client");
    const client = await clientConfigTable.findOne({
      where: { user_id: userId },
    });
    if (!client || client.length === 0) {
      await clientConfigTable.create({
        user_id: userId,
        product_id: productCode,
        client_url: url,
      });
      return;
    } else if (client.product_id != productCode) {
      throw new Error(RESPONSE_STATUS_CONSTANTS.FAILED);
    } else if (client.client_url != url) {
      client.client_url = url;
      await client.save();
      console.log("updated client url", client.client_url);
      return;
    }
    return;
  } catch (error) {
    console.log("sorry !!! failed to register client ", error);
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
  startJob,
};

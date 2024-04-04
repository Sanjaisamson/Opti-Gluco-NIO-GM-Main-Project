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
const {
  fileConfig,
  defaultDir,
  clientConfig,
} = require("../config/fileConfig");
const path = require("path");

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
    console.log("error on create job");
    await jobStatusTable.create({
      job_id: DUMMY_DATA.job_id,
      job_status: JOB_STATUS.FAILED,
      request_id: requestId,
    });
    await updateStatusOnServer(DUMMY_DATA.job_id, JOB_STATUS.FAILED, requestId);
    throw error;
  }
}
async function readData(jobId, requestId, count, folder) {
  return new Promise(async (resolve, reject) => {
    try {
      const filename = `${defaultDir.dir_name}/85-95_original_image.jpg`; //`${requestId}image${count}.jpg`
      // const command = `raspistill -o ${filename} -co 70 -br 70 -ISO 800 -w 640 -h 480`;
      // exec(command, (error) => {
      //   if (error) {
      //     console.log("error on capturing images", error);
      //     reject(new Error(`Error capturing images: ${error.message}`));
      //     return;
      //   }
      //   console.log("Images captured successfully...");
      //   const fileData = fs.readFileSync(filename);
      //   const filepath = path.join(folder, filename);
      //   fs.writeFile(filepath, fileData, (err) => {
      //     if (err) {
      //       throw err;
      //     }
      //   });
      //   const jobStatus = JOB_STATUS.PROGRESS;
      //   resolve({ jobId, jobStatus, filename, folder, fileData, requestId });
      // });
      console.log("Images captured successfully...");
      const fileData = fs.readFileSync(filename);
      const filepath = path.join(folder, filename);
      fs.writeFile(filepath, fileData, (err) => {
        if (err) {
          throw err;
        }
      });
      const jobStatus = JOB_STATUS.PROGRESS;
      resolve({ jobId, jobStatus, filename, folder, fileData, requestId });
    } catch (error) {
      console.log("error at read data", error);
      reject(error);
    }
  });
}
async function deleteFolder(folder) {
  try {
    fs.rmdir(folder, {
      recursive: true,
    });
    console.log("folder removed successfully");
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
      const folder = `${defaultDir.dir_name}_${requestId}`;
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
          await deleteFolder(data.folder);
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
async function readDataUsingCam(jobId, requestId, folder) {
  try {
  } catch (error) {}
}

async function startJob(requestId, jobId, productCode) {
  try {
    const images = [];
    const folder = `${defaultDir.dir_name}_${requestId}`;
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, {
        recursive: true,
      });
    }
    const data = await readData(jobId, requestId, folder);
    const files = await fsPromises.readdir(folder);
    console.log(typeof (folder, files));
    for (let i = 0; i <= files.length; i++) {
      console.log(files);
      const filePath = path.join(folder, files[i]);
      const fileData = fs.readFileSync(filePath);
      images.push(fileData);
      await jobDataTable.create({
        job_id: jobId,
        job_status: JOB_STATUS.SUCCESS,
        request_id: requestId,
        file_name: files[i],
      });
    }
    const controller = new AbortController();
    const timeout = 30000;
    const signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      await sendResult(images, requestId, jobId, userId, productCode, signal);
      clearTimeout(timeoutId);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        console.error("Request timed out!");
        // Handle timeout scenario (e.g., retry, notify user)
      } else {
        console.error("Error:", error);
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
    console.log("error at start job", error);
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
    throw error;
  }
}
async function updateStatusOnServer(jobId, jobStatus, requestId, productCode) {
  try {
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
    console.log("error at updateStatusOnServer", error);
    throw error;
  }
}

async function sendResult(images, requestId, jobId, userId, productCode) {
  try {
    const client = await clientConfigTable.findOne({
      where: {
        product_id: productCode,
      },
    });
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
    const response = await fetch(
      `http://${client.client_url}/product/results`,
      { timeout: 5000 },
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
    console.log("error at send result", error);
    const job = await jobStatusTable.findOne({
      where: { job_id: jobId },
    });
    job.job_status = JOB_STATUS.FAILED;
    await job.save();
    await updateStatusOnServer(jobId, job.jobStatus, requestId);
    throw error;
  }
}
async function registerClient(url, productCode, userId) {
  try {
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
      return;
    }
    return;
  } catch (error) {
    console.log("error at register client api", error);
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

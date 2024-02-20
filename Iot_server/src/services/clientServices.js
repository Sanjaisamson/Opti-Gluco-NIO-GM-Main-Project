const { ulid } = require("ulid");
const http = require("http");
const fs = require("fs");
const { exec } = require("child_process");
const { jobStatusTable } = require("../models/jobStatusModel");

async function createJob(payload) {
  try {
    // if (payload.productId == process.env.PRODUCT_ID) {
    const jobId = ulid();
    const jobStatus = "job Initiated";
    const updatedJob = await jobStatusTable.create({
      job_id: jobId,
      job_status: jobStatus,
    });
    return { job_id: updatedJob.job_id, job_status: updatedJob.job_status };
    // } else {
    //   throw new Error(400, "product_id not matching !!!");
    // }
  } catch (error) {
    throw error;
  }
}
async function readData(job_id, job_status) {
  try {
    let jobStatus = job_status;
    // const imageCaptured = exec(
    //   "raspistill -o image%d.jpg -tl 8000 -t 128000",
    //   (error, stdout, stderr) => {
    //     if (error) {
    //       jobStatus = "failed";
    //       console.error(`Error capturing images: ${error.message}`);
    //       throw new Error(500, "Internal server error !!!");
    //     }
    //     if (stderr) {
    //       jobStatus = "failed";
    //       console.error(`Error capturing images: ${stderr}`);
    //       throw new Error(500, "Internal server error !!!");
    //     }
    //     console.log("Images captured successfully...");
    //     jobStatus = "on-progress";
    //   }
    // );
    const images = [];
    for (let i = 1; i <= 15; i++) {
      const filename =
        "C:\\Users\\SANJAI\\OneDrive\\Documents\\Main_Project\\dummy_data\\bg picture - Copy - Copy.jpg"; //`image${i}.jpg` C:\Users\SANJAI\OneDrive\Documents\Main_Project\dummy_data\bg picture - Copy - Copy.jpg
      try {
        const fileData = fs.readFileSync(filename);
        images.push({ name: filename, data: fileData });
      } catch (error) {
        jobStatus = "failed";
        console.error("Error on reading file:", error);
        break;
      }
    }
    if (images.length < 15) {
      jobStatus = "on-progress";
    } else {
      jobStatus = "completed";
    }
    const job = await jobStatusTable.findOne({
      where: { job_id: job_id },
    });
    job.job_status = jobStatus;
    await job.save();
    return { job_id, jobStatus, images };
  } catch (error) {
    throw error;
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
  } catch (error) {}
}
module.exports = { createJob, readData, checkStatus };

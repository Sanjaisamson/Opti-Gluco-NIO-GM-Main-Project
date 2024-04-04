const JOB_STATUS = {
  INITIATED: "Initiated",
  PROGRESS: "on-progress",
  FAILED: "Failed",
  SUCCESS: "Completed",
};

const CRON_CONSTANTS = {
  CRONE_JOB_INTERVAL: "*/1 * * * * *",
  JOB_COUNT: 2,
};

const DUMMY_DATA = {
  job_id: "dummy_Job_id",
};

const RESPONSE_STATUS_CONSTANTS = {
  SUCCESS: 200 || 201,
  FAILED: 400 || 404,
  SERVER_ERROR: 500,
};

module.exports = {
  JOB_STATUS,
  CRON_CONSTANTS,
  DUMMY_DATA,
  RESPONSE_STATUS_CONSTANTS,
};

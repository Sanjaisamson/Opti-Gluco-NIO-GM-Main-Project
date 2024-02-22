const JOB_STATUS = {
  INITIATED: "Initiated",
  PROGRESS: "on-progress",
  FAILED: "Failed",
  SUCCESS: "Completed",
};

const CRON_CONSTANTS = {
  CRONE_JOB_INTERVAL: "*/1 * * * * *",
  JOB_COUNT: 3,
};

module.exports = {
  JOB_STATUS,
  CRON_CONSTANTS,
};

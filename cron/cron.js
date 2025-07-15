// This file is part of the backend configuration for a cron job that sends a GET request to an API endpoint every 14 minutes.
// It uses the `cron` package to schedule the job and the `https` module to make the GET request.


import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/4 * * * *", function () {
  https
    .get(process.env.DATABASE_URL, (res) => {
      if (res.statusCode === 200) console.log("GET request sent successfully");
      else console.log("GET request failed", res.statusCode);
    })
    .on("error", (e) => console.error("Error while sending request", e));
});

export default job;

// CRON JOB:
// Cron jobs are scheduled tasks that run periodically at fixed intervals
// send 1 GET request for every 14 minutes so that our api never gets inactive on Render.com
// You define a schedule using a cron expression, which consists of 5 fields representing:
// MINUTE, HOUR, DAY, MONTH, DAY OF THE WEEK
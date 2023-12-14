import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";

import cleanupresets from "./cleanupresets.js";

const scheduler = new ToadScheduler();

const resetcleaup = new AsyncTask(
  "Cleanup Expired Password Resets",
  () => {
    // It is recommended to use promise chains instead of async/await inside task definition to prevent memory leaks
    return cleanupresets().then((result) => {
      console.log(result);
    });
  },
  (err) => {
    /* handle error here */
    console.log(
      "Failed to perform deletion of expired password reset requests"
    );
    console.log(err);
  }
);

const regularResetCleanup = new SimpleIntervalJob(
  { minutes: 30 },
  resetcleaup,
  { id: "id_1" }
);

scheduler.addSimpleIntervalJob(regularResetCleanup);

scheduler.stop();
export default scheduler;

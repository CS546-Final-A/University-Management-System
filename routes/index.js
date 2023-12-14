import express from "express";

import signin from "./middleware/signedin.js";
import adminsOnly from "./middleware/admin.js";
import ratelimit from "./middleware/limits.js";

import login from "./login.js";
import register from "./registration.js";
import logout from "./logout.js";
import dashboard from "./dashboard.js";
import user_management from "./administration/users.js";
import courses from "./courses/courses.js";
import workspace from "./workspace/workspace.js";
import * as a from "../data/assignments/assignments.js";

function route(app) {
  app.use("/scripts", express.static("./static/scripts"));
  app.use("/styles", express.static("./static/styles"));

  app.use("/login", ratelimit.login);
  app.use("/login", login);

  app.use("/register", ratelimit.registration);
  app.use("/register", register);

  app.use("/", ratelimit.general); // Limit users to 1000 requests per 15 minutes
  app.use("/", signin); // Only allow signed in users to access routes below this one
  app.use("/logout", logout);
  app.use("/dashboard", dashboard);

  app.use("/users", adminsOnly);
  app.use("/users", user_management);

  app.use("/courses", courses);
  app.use("/workspace", workspace);
}

export default route;

import express from "express";

import login from "./login.js";
import dashboard from "./dashboard.js";

function route(app) {
  app.use("/scripts", express.static("./static/scripts"));
  app.use("/styles", express.static("./static/styles"));

  app.use("/login", login);
  app.use("/dashboard", dashboard);
}

export default route;

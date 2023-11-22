import express from "express";

import signin from "./middleware/signedin.js";
import adminsOnly from "./middleware/admin.js";

import login from "./login.js";
import logout from "./logout.js";
import dashboard from "./dashboard.js";
import create_user from "./createuser.js";

function route(app) {
  app.use("/scripts", express.static("./static/scripts"));
  app.use("/styles", express.static("./static/styles"));

  app.use("/login", login);

  app.use("/", signin); // Only allow signed in users to access routes below this one
  app.use("/logout", logout);
  app.use("/dashboard", dashboard);

  app.use("/create/user", adminsOnly);
  app.use("/create/user", create_user);
}

export default route;

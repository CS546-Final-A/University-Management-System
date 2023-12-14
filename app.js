import "dotenv/config";
import express from "express";
import session from "express-session";
import lusca from "lusca";
import exphbs from "express-handlebars";
import { fileURLToPath } from "url";
import { dirname } from "path";

import SMTPConnect from "./config/smptConnection.js";
import { dbConnection } from "./config/mongoConnection.js";
import route from "./routes/index.js";

import scheduler from "./cronjobs/index.js";
import cleanupresets from "./cronjobs/cleanupresets.js";

const smptconnection = SMTPConnect();
const databaseconnection = dbConnection();

const app = express();

// Serve static files from the 'icons' directory
const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);
const iconsDir = express.static(__dirname + "/static/icons");
app.use("/icons", iconsDir);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.CookieSecret,
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/", (req, res, next) => {
  if (req.body._csrf) {
    req.headers["x-csrf-token"] = req.body._csrf;
    delete req.body._csrf;
  }
  next();
});

// app.use(
//   lusca({
//     csrf: true,
//     /*csp: {
//        ...
//     },*/
//     xframe: "SAMEORIGIN",
//     p3p: "ABCDEF",
//     hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
//     xssProtection: true,
//     nosniff: true,
//     referrerPolicy: "same-origin",
//   })
// );

// Define the eq helper
const eqHelper = function (a, b) {
  return a === b;
};

const gtHelper = function (a, b) {
  return a > b;
};

const handlebars = exphbs.create({
  defaultLayout: "main",
  partialsDir: ["views/partials/"],
  helpers: { eq: eqHelper, gt: gtHelper },
});

app.engine("handlebars", handlebars.engine);

app.set("view engine", "handlebars");
app.set("views", "./views");

route(app);

smptconnection.verify(function (error, success) {
  if (error) {
    console.log(error);
    throw "Failed to connect to SMTP";
  } else {
    console.log("Connected to SMTP Server");
  }
});

if (await databaseconnection) {
  console.log("Connected to Database Server");
  try {
    cleanupresets().then((result) => {
      console.log(result);
    });
  } catch (e) {
    console.log(
      "Failed to perform deletion of expired password reset requests"
    );
    console.log(e);
  }
  scheduler.startById("id_1");
} else {
  throw "Failed to connect to database";
}

app.listen(8080, () => {
  console.log("Running web server on port 8080");
  console.log(`http://localhost:8080/`);
});

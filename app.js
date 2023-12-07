import "dotenv/config";
import express from "express";
import session from "express-session";
import lusca from "lusca";
import { engine } from "express-handlebars";

import SMTPConnect from "./config/smptConnection.js";
import { dbConnection } from "./config/mongoConnection.js";
import route from "./routes/index.js";

const smptconnection = SMTPConnect();
const databaseconnection = dbConnection();

const app = express();

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

app.use(
  lusca({
    csrf: true,
    /*csp: {
			 ... 
		},*/
    xframe: "SAMEORIGIN",
    p3p: "ABCDEF",
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    xssProtection: true,
    nosniff: true,
    referrerPolicy: "same-origin",
  })
);

app.engine("handlebars", engine());
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
} else {
  throw "Failed to connect to database";
}

app.listen(8080, () => {
  console.log("Running web server on port 8080");
});

import "dotenv/config";
import express from "express";
import session from "express-session";
import lusca from "lusca";
import { engine } from "express-handlebars";

import loginroutes from "./routes/login.js";

const app = express();


app.use(express.json());

app.use(
  session({
    secret: process.env.CookieSecret,
    resave: false,
    saveUninitialized: false,
  })
);

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

app.listen(8080, () => {
  console.log("Running web server on port 8080");
});

app.get("/", (req, res) => {
  res.render("public/index", { name: "Developer" });
});

app.use("/scripts", express.static("./static/scripts"));

app.use("/login", loginroutes);

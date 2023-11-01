import express from "express";
import session from "express-session";
import lusca from "lusca";
import ejs from "ejs";

const app = express();

app.use(session({ secret: "I need to be moved to .env", resave: false, saveUninitialized: false }));

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

app.set("view engine", ejs);

app.listen(8080, () => {
	console.log("Running web server on port 8080");
});

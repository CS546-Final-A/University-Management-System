import { Router } from "express";

import verify from "../data_validation.js";
import identificationVerificationHTML from "../data/identificationVerifierHTML.js";
import getIdentificationByUserID from "../data/getUnregisteredUserIdentification.js";

function routeError(res, e) {
  if (e.status) {
    res.status(e.status);
    if (e.status >= 500) {
      console.log("Error:");
      console.log(e.message);
      e.message = "Internal server error";
    }
    return res.render("public/error", { error: e.message });
  } else {
    console.log("Error:");
    console.log(e);
    res.status(500);
    return res.render("public/error", { error: "Internal server error" });
  }
}

const router = Router();

router.get("/setpassword", (req, res) => {
  if (!req.session.registrationuserid) {
    const error = {
      status: 401,
      message: "You attempted to access a page without proper authentication",
    };
    return routeError(res, error);
  }
});

router.get("/:userid", async (req, res) => {
  if (req.session.registrationuserid) {
    return res.redirect("/register/setpassword");
  }
  try {
    const id = req.params.userid;

    const identification = await getIdentificationByUserID(id);

    return res.render("public/registration", {
      identification: identification.type,
      identificationverification: identificationVerificationHTML(
        identification.type
      ),
    });
  } catch (e) {
    return routeError(res, e);
  }
});

router.post("/:userid", async (req, res) => {
  if (req.session.registrationuserid) {
    return res.redirect("/register/setpassword");
  }
  let identification;
  try {
    const id = req.params.userid;
    identification = await getIdentificationByUserID(id);
  } catch (e) {
    return routeError(res, e);
  }
  const idnum = req.body.idconf;
  const idtype = req.body.idtype;
  if (identification.type === idtype && identification.number === idnum) {
    req.session.registrationuserid = req.params.userid;
    return res.redirect("/register/setpassword");
  } else {
    res.render("public/registration", {
      identification: identification.type,
      identificationverification: identificationVerificationHTML(
        identification.type
      ),
      error: "Invalid identification",
    });
  }
});

export default router;

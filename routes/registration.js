import { Router } from "express";

import verify from "../data_validation.js";
import identificationVerificationHTML from "../data/identificationVerifierHTML.js";
import getUserByID from "../data/users/getUserInfoByID.js";
import getUnregisteredIdentificationByUserID from "../data/getUnregisteredUserIdentification.js";

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

router.get("/setpassword", async (req, res) => {
  try {
    if (!req.session.registrationuserid) {
      const error = {
        status: 401,
        message: "You attempted to access a page without proper authentication",
      };
      throw error;
    }
    let userinfo;
    try {
      userinfo = await getUserByID(req.session.registrationuserid, {
        _id: 0,
        firstname: 1,
        lastname: 1,
      });
    } catch (e) {
      // The userID has already been verified any issues resulting from the above code are caused by an error in the data function
      // Set status to server error and rethrow
      e.status = 500;
      throw e;
    }

    return res.render("public/setpassword", userinfo);
  } catch (e) {
    return routeError(res, e);
  }
});

router.patch("/setpassword", (req, res) => {
  try {
    if (!req.session.registrationuserid) {
      const error = {
        status: 401,
        message: "You attempted to access a page without proper authentication",
      };
      throw error;
    }

    return res.render("public/setpassword");
  } catch (e) {
    return routeError(res, e);
  }
});

router.get("/:userid", async (req, res) => {
  if (req.session.registrationuserid) {
    return res.redirect("/register/setpassword");
  }
  try {
    const id = req.params.userid;

    const identification = await getUnregisteredIdentificationByUserID(id);

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
    identification = await getUnregisteredIdentificationByUserID(id);
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

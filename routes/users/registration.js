import { Router } from "express";

import verify from "../../data_validation.js";
import getUserByID from "../../data/users/getUserInfoByID.js";
import getRegistrationInfo from "../../data/users/getRegistrationInfo.js";
import setPassword from "../../data/users/setPasswordByID.js";
import routeError from "../routeerror.js";

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

    userinfo.script = "users/setpassword";
    return res.render("public/setpassword", userinfo);
  } catch (e) {
    return routeError(res, e);
  }
});

router.patch("/setpassword", async (req, res) => {
  try {
    if (!req.session.registrationuserid) {
      const error = {
        status: 401,
        message: "You attempted to access a page without proper authentication",
      };
      throw error;
    }

    const password = verify.password(req.body.password);
    const passwordconf = verify.password(req.body.passwordconf);

    if (password !== passwordconf) {
      throw { status: 400, message: "Passwords do not match" };
    }

    const result = await setPassword(req.session.registrationuserid, password);

    if (result.acknowledged) {
      // Prevent user from accessing password setting page
      delete req.session.registrationuserid;
      return res.json({ successful: result.acknowledged });
    } else {
      throw {
        status: 500,
        message: "Password setting request not acknowledged by database",
      };
    }
  } catch (e) {
    if (e.status !== 500 && e.status) {
      res.status(e.status);
      return res.json({ error: e.message });
    } else {
      if (e.message) {
        console.log("Error: " + e.message);
      } else {
        console.log("Error: " + e);
      }
      res.status(500);
      res.json({ error: "Internal Server Error" });
    }
  }
});

router.get("/:registrationcode", async (req, res) => {
  if (req.session.registrationuserid) {
    return res.redirect("/register/setpassword/");
  }
  try {
    const registrationcode = verify.UUID(req.params.registrationcode);

    const user = await getRegistrationInfo(registrationcode);

    return res.render("public/registration", {
      identification: user.identification.type,
      identificationverification: `users/registerby${user.identification.type}`,
      script: "users/registration",
    });
  } catch (e) {
    return routeError(res, e);
  }
});

router.post("/:registrationcode", async (req, res) => {
  if (req.session.registrationuserid) {
    return res.redirect("/register/setpassword/");
  }
  let user;
  try {
    try {
      const registrationcode = verify.UUID(req.params.registrationcode);
      user = await getRegistrationInfo(registrationcode);
    } catch (e) {
      return routeError(res, e);
    }
    const idnum = req.body.idconf;
    const idtype = req.body.idtype;
    if (
      user.identification.type === idtype &&
      user.identification.number === idnum
    ) {
      req.session.registrationuserid = user._id;
      return res.redirect("/register/setpassword/");
    } else {
      res.render("public/registration", {
        identification: user.identification.type,
        identificationverification: `users/registerby${user.identification.type}`,
        error: "Invalid identification",
        script: "users/registration",
      });
    }
  } catch (e) {
    routeError(res, e);
  }
});

export default router;

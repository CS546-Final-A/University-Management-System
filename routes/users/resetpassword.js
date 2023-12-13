import { Router } from "express";

import verify from "../../data_validation.js";

import initiatePasswordReset from "../../data/users/initiatePasswordReset.js";
import getPasswordResetInfo from "../../data/users/getPasswordResetInfo.js";
import routeError from "../routeerror.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("public/requestpasswordreset", {
    script: "requestpasswordreset",
  });
});

router.put("/", async (req, res) => {
  try {
    const email = verify.email(req.body.email);

    const result = await initiatePasswordReset(email);

    res.json({ successful: result.successful });
  } catch (e) {
    if (e.status !== 500 && e.status) {
      res.status(e.status);
      return res.json({ error: e.message });
    } else {
      if (e.message) {
        console.log(e.message);
      } else {
        console.log(e);
      }
      res.status(500);
      res.json({ error: "Internal Server Error" });
    }
  }
});

router.get("/:requestid", async (req, res) => {
  try {
    const id = verify.validateMongoId(req.params.requestid, "PasswordResetID");
    const reset = await getPasswordResetInfo(id);
    res.render("public/resetpassword", {
      script: "resetpassword",
    });
  } catch (e) {
    if (e.status === 404 || e.status === 400) {
      res.status(e.status);
      return res.render("public/requestpasswordreset", {
        script: "requestpasswordreset",
      });
    } else {
      return routeError(res, e);
    }
  }
});

export default router;

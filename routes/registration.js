import { Router } from "express";

import verify from "../data_validation.js";
import identificationVerificationHTML from "../data/identificationVerifierHTML.js";
import getIdentificationByUserID from "../data/getIdentificationByUserID.js";

const router = Router();

router.get("/:userid", async (req, res) => {
  try {
    const id = req.params.userid;

    const identification = await getIdentificationByUserID(id);

    res.render("public/registration", {
      identification: identification.type,
      identificationverification: identificationVerificationHTML(
        identification.type
      ),
    });
  } catch (e) {
    if (e.status) {
      res.status(e.status);
      res.render("public/error", { error: e.message });
    } else {
      console.log("Error:");
      console.log(e);
      res.status(500);
      res.render("public/error", { error: "Internal server error" });
    }
  }
});

router.post("/:userid", async (req, res) => {
  let identification;
  try {
    const id = req.params.userid;
    identification = await getIdentificationByUserID(id);
  } catch (e) {
    if (e.status) {
      res.status(e.status);
      res.render("public/error", { error: e.message });
    } else {
      console.log("Error:");
      console.log(e);
      res.status(500);
      res.render("public/error", { error: "Internal server error" });
    }
  }
  const idnum = req.body.idconf;
  const idtype = req.body.idtype;
  if (identification.type === idtype && identification.number === idnum) {
    // activateuseraccount(id)
    res.render("resetpassword");
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

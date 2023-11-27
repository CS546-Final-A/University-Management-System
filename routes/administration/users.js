import { Router } from "express";

import verify from "../../data_validation.js";
import createUser from "../../data/createuser.js";

const router = Router();

router.get("/create", (req, res) => {
  res.render("admin/createuser");
});

router.put("/create", (req, res) => {
  try {
    const firstname = verify.name(req.body.firstname);
    const lastname = verify.name(req.body.lastname);
    const email = verify.email(req.body.email);
    const identification = req.body.identification;
    if (identification.type === "ssn") {
      identification.number = verify.ssn(identification.number);
    } else {
      throw "Invalid identification type";
    }
    const accountype = verify.accountype(req.body.accountype);

    createUser(firstname, lastname, email, identification, accountype);
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});

export default router;

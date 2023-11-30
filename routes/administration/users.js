import { Router } from "express";

import verify from "../../data_validation.js";
import createUser from "../../data/createuser.js";

const router = Router();

router.get("/create", (req, res) => {
  res.render("admin/createuser");
});

router.put("/create", async (req, res) => {
  try {
    const firstname = verify.name(req.body.firstname);
    const lastname = verify.name(req.body.lastname);
    const email = verify.email(req.body.email);
    const identification = verify.governmentID(req.body.identification);
    const accountype = verify.accountype(req.body.accountype);

    await createUser(firstname, lastname, email, identification, accountype);
  } catch (e) {
    if (e.status !== 500 && e.status) {
      res.status(e.status);
      return res.json({ error: e.message });
    } else {
      console.log(e);
      res.status(500);
      return res.json({ error: "Internal server error" });
    }
  }
});

export default router;

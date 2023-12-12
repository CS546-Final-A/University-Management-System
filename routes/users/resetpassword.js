import { Router } from "express";

import verify from "../../data_validation.js";

import initiatePasswordReset from "../../data/users/initiatePasswordReset.js";

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

export default router;

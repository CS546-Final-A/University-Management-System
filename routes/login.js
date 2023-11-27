import { Router } from "express";

import login from "../data/login.js";
import verify from "../data_validation.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("public/login", { style: "login" });
});

router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const email = verify.email(data.email);
    const password = verify.password(data.password);
    const result = await login(email, password);

    if (result.successful) {
      req.session.userid = result.id;
      req.session.type = result.type;
    }

    res.json({ loggedin: result.successful });
  } catch (e) {
    if (
      e === "Invalid email" ||
      e === "Password is not a string" ||
      e === "Password is empty" ||
      e === "Password is too long"
    ) {
      res.status(400);
      res.json({ error: e });
    } else {
      res.status(500);
      res.json({ error: "Login error" });
    }
  }
});

export default router;

import { Router } from "express";

import login from "../data/login.js";
import verify from "../data_validation.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("public/login", { style: ["login", "error"] });
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
      req.session.name = result.name;
      req.session.email = result.email;
    }

    res.json({ loggedin: result.successful });
  } catch (e) {
    if (e.status !== 500 && e.status) {
      res.status(e.status);
      return res.json({ error: e.message });
    } else {
      console.log(e);
      res.status(500);
      res.json({ error: "Login error" });
    }
  }
});

export default router;

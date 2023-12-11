import { Router } from "express";

import verify from "../../data_validation.js";

const router = Router();

router.get("/", (req, res) => {
  res.render("public/requestpasswordreset");
});

export default router;

import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.render("public/dashboard", { name: req.session.type });
});

export default router;

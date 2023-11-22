import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.render("admin/createuser");
});

export default router;

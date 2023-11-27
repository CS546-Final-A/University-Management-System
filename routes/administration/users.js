import { Router } from "express";

const router = Router();

router.get("/create", (req, res) => {
  res.render("admin/createuser");
});

export default router;

import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.render("public/login");
});

router.post("/", (req, res) => {
  res.json({ result: "Yay" });
});

export default router;

import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  req.session.destroy();
  res.render("public/logout");
});

export default router;

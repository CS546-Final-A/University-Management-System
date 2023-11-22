import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  if (req.session.type === "Admin") {
    return res.render("admin/dashboard", { name: req.session.type });
  } else {
    return res.render("public/dashboard", { name: req.session.type });
  }
});

export default router;

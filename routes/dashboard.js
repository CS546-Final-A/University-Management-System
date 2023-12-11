import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  let renderObjs = {
    name: req.session.name,
    type: req.session.type,
    email: req.session.email,
  };

  if (req.session.type === "Admin") {
    return res.render("admin/dashboard", renderObjs);
  } else {
    return res.render("public/dashboard", renderObjs);
  }
});

export default router;

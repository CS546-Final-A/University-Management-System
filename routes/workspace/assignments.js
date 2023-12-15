import { Router } from "express";
const router = Router();
import { getAssignmentsBySectionId } from "../../data/assignments/assignments.js";

router.get("/", async (req, res) => {
  try {
    const renderObjs = { layout: "sidebar", script: "assignments/list" };
    renderObjs.assignments = await getAssignmentsBySectionId(
      res.locals.sectionID
    );

    res.render("assignments/list", renderObjs);
  } catch (e) {
    if (e.status !== 500 && e.status) {
      res.status(e.status);
      return res.render("public/error", {
        error: e.message,
      });
    } else {
      console.log(e);
      res.status(500);
      return res.render("public/error", {
        error: "Internal Server Error",
      });
    }
  }
});

export default router;

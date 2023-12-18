import { Router } from "express";
const router = Router();
import {
  getAssignmentById,
  getAssignmentsBySectionId,
} from "../../data/assignments/assignments.js";
import routeError from "../routeerror.js";
import verify from "../../data_validation.js";

router.use("/*/:assignmentID", async (req, res, next) => {
  try {
    const assignmentID = verify.validateMongoId(req.params.assignmentID);
    res.locals.assignment = await getAssignmentById(assignmentID);
    next();
  } catch (e) {
    routeError(res, e);
  }
});

router.get("/view/:assignmentID", async (req, res) => {
  try {
    res.render("assignments/view");
  } catch (e) {
    routeError(res, e);
  }
});

router.get("/edit/:assignmentID", async (req, res) => {
  try {
    if (req.session.type !== "Professor") {
      throw {
        status: 403,
        message: "You do not have edit rights for this assignment",
      };
    }
    res.render("assignments/edit");
  } catch (e) {
    routeError(res, e);
  }
});

router.get("/", async (req, res) => {
  try {
    const renderObjs = { script: "assignments/list" };
    renderObjs.assignments = await getAssignmentsBySectionId(
      res.locals.sectionID
    );

    res.render("assignments/list", renderObjs);
  } catch (e) {
    routeError(res, e);
  }
});

export default router;

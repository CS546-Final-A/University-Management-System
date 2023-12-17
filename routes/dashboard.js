import { Router } from "express";
import * as courseData from "../data/courses/courses.js";
import getUserByID from "../data/users/getUserInfoByID.js";
import * as prefRoute from "../data/users/setPreference.js";

const router = Router();

router
  .get("/", async (req, res) => {
    if (req.session.type === "Admin") {
      return res.render("admin/dashboard");
    }

    const userInfo = await getUserByID(req.session.userid);
    const registeredCourses = userInfo.registeredCourses || [];

    const requestedSections = await courseData.getSectionsByIds(
      registeredCourses.map((course) => course)
    );

    let renderObjs = {};
    const workspace = requestedSections.map((section) => {
      return {
        courseName: section.courseName,
        courseNumber: section.courseNumber,
        sectionType: section.sectionType,
        sectionName: section.sectionName,
        sectionId: section.sectionId.toString(),
      };
    });

    renderObjs.workspace = workspace;
    return res.render("public/dashboard", renderObjs);
  })
  .post("/", async (req, res) => {
    try {
      const result = await prefRoute.setTheme(
        req.session.userid,
        req.body.darkmode
      );
      req.session.darkmode = req.body.darkmode;

      res.status(200).json({ message: "Theme updated successfully", result });
    } catch (e) {
      return res.status(e.status).json(e.message);
    }
  });

export default router;

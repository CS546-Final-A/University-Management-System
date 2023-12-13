import { Router } from "express";
import * as courseData from "../data/courses/courses.js";
import getUserByID from "../data/users/getUserInfoByID.js";

const router = Router();

router.get("/", async (req, res) => {
  const { name, type, email, userid } = req.session;
  const renderObjs = { name, type, email };

  if (type === "Admin") {
    return res.render("admin/dashboard", renderObjs);
  }

  const userInfo = await getUserByID(userid);
  const registeredCourses = userInfo.registeredCourses || [];

  const requestedSections = await courseData.getSectionsByIds(
    registeredCourses.map((course) => course)
  );

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
});

export default router;

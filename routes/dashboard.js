import { Router } from "express";
import * as sectionData from "../data/sections/sections.js";
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

  const requestedSections = await sectionData.getSectionsByIds(
    registeredCourses.map((course) => course)
  );
  const courseIds = requestedSections.map((section) => section.courseId);

  const requestedCourses = await courseData.getCoursesByIds(courseIds);

  const workspace = requestedSections.map((section) => {
    const course = requestedCourses.find(
      (c) => c._id.toString() === section.courseId.toString()
    );

    return {
      courseName: course.courseName,
      courseNumber: course.courseNumber,
      sectionType: section.sectionType,
      sectionName: section.sectionName,
      sectionId: section._id.toString(),
    };
  });

  renderObjs.workspace = workspace;
  return res.render("public/dashboard", renderObjs);
});

export default router;

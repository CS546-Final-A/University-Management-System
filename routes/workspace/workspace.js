import { Router } from "express";
const router = Router();
import * as courseData from "../../data/courses/courses.js";
import getUserByID from "../../data/users/getUserInfoByID.js";
router.route("/:sectionId").get(async (req, res) => {
  const section = await courseData.getSectionById(req.params.sectionId);
  const course = await courseData.getCourseById(section.courseId.toString());

  const profName = await getUserByID(section.sectionInstructor, {
    _id: 0,
    firstname: 1,
    lastname: 1,
  });

  res.render("workspace/section", {
    layout: "sidebar",
    sectionID: `${section.sectionId}`,
    courseId: `${section.courseId.toString()}`,
    courseName: `${course.courseName}`,
    sectionName: `${section.sectionName}`,
    sectionInstructor: `${section.sectionInstructor}`,
    fN: `${profName.firstname}`,
    lN: `${profName.lastname}`,
    sectionType: `${section.sectionType}`,
    sectionStartTime: `${section.sectionStartTime}`,
    sectionEndTime: `${section.sectionEndTime}`,
    sectionDay: `${section.sectionDay}`,
    sectionCapacity: `${section.sectionCapacity}`,
    sectionYear: `${section.sectionYear}`,
    sectionSemester: `${section.sectionSemester}`,
    students: `${section.students}`,
    sectionLocation: `${section.sectionLocation}`,
    sectionDescription: `${section.sectionDescription}`,
  });
});
router.route("/:sectionId/modules").get(async (req, res) => {
  const section = await courseData.getSectionById(req.params.sectionId);
  res.render("workspace/module", {
    modules: section.sectionModules,
    sectionID: `${section.sectionId}`,
  });
});

router.route("/:sectionId/modules/attendance").get(async (req, res) => {
  res.render("workspace/attendance");
});

router.route("/:sectionId/assignments").get(async (req, res) => {
  const section = await courseData.getSectionById(req.params.sectionId);
  res.render("workspace/assignments", {
    assignments: section.Assignments,
    sectionID: `${section.sectionId}`,
  });
});

export default router;

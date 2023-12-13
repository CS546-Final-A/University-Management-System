import { Router } from "express";
const router = Router();
import { getSectionById } from "../../data/sections/sections.js";
import { getCourseById } from "../../data/courses/courses.js";
import getUserByID from "../../data/users/getUserInfoByID.js";
router.route("/:sectionId").get(async (req, res) => {
  const section = await getSectionById(req.params.sectionId);
  const course = await getCourseById(section.courseId.toString());

  const profName = await getUserByID(section.sectionInstructor, {
    _id: 0,
    firstname: 1,
    lastname: 1,
  });

  res.render("workspace/section", {
    layout: "sidebar",
    sectionID: `${section._id}`,
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
  const section = await getSectionById(req.params.sectionId);
  res.render("workspace/module", {
    modules: section.sectionModules,
    sectionID: `${section._id}`,
  });
});

router.route("/:sectionId/modules/attendance").get(async (req, res) => {
  res.render("workspace/attendance");
});

router.route("/:sectionId/assignments").get(async (req, res) => {
  const section = await getSectionById(req.params.sectionId);
  res.render("workspace/assignments", {
    assignments: section.Assignments,
    sectionID: `${section._id}`,
  });
});
export default router;

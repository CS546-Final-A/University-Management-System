import { Router, query } from "express";
import { santizeInputs } from "../../data_validation.js";
import * as courseDataFunctions from "../../data/courses/courses.js";
import util from "util";
import { unsubscribe } from "diagnostics_channel";
import {
  validateCourse,
  validateSection,
} from "../../data/courses/courseHelper.js";

const router = Router();

router.get("/", async (req, res) => {
  let uniqueSectionYearandSemester =
    await courseDataFunctions.getUniqueSectionYearandSemester();

  res.render("courses/landing", {
    uniqueYear: uniqueSectionYearandSemester[0],
    uniqueSemester: uniqueSectionYearandSemester[1],
  });
});

router.get("/:courseId", async (req, res) => {
  const { courseId } = req.params;
  try {
    let data = await courseDataFunctions.getCourseById(courseId);
    // res.send(data);
    // console.log("in");

    // console.log(util.inspect(data, { showHidden: false, depth: null }));

    // console.log("out");
    res.render("courses/courseDetails", { courses: data });
  } catch (e) {
    if (e.status !== 500 && e.status) {
      res.status(e.status);
      return res.json({ error: e.message });
    } else {
      console.log(e);
      res.status(500);
      res.json({ error: "Login error" });
    }
  }
  // res.render("courses/course", {
  //   course: data,
  // });
});

router.get("/registration", async (req, res) => {
  let uniqueDepartmentNames =
    await courseDataFunctions.getUniqueDepartmentNamesandId();
  res.render("courses/registration", { uniqueDepartmentNames });
});

router.post("/registration", async (req, res) => {
  const {
    courseNumber,
    courseName,
    courseDepartmentId,
    courseCredits,
    courseDescription,
  } = req.body;
  try {
    const course = validateCourse(
      courseNumber,
      courseName,
      courseDepartmentId,
      courseCredits,
      courseDescription
    );
    let result = await courseDataFunctions.registerCourse(
      course.courseNumber,
      course.courseName,
      course.courseDepartmentId,
      course.courseCredits,
      course.courseDescription
    );
    res.render();
  } catch (error) {
    if (e.status !== 500 && e.status) {
      res.status(e.status);
      return res.json({ error: e.message });
    } else {
      console.log(e);
      res.status(500);
      res.json({ error: "Login error" });
    }
  }
  // res.render("courses/registration");
});

router.get("/:year/:semester/listings", async (req, res) => {
  const { year, semester } = req.params;

  let {
    searchTerm,
    departmentFilter,
    instructorFilter,
    meetingDaysFilter,
    deliveryModeFilter,
  } = req.query;
  let data = await courseDataFunctions.getAllCourses(
    year,
    semester,
    searchTerm,
    departmentFilter,
    instructorFilter,
    meetingDaysFilter,
    deliveryModeFilter
  );
  data.year = year;
  data.semester = semester;

  let uniqueDepartmentNames =
    await courseDataFunctions.getUniqueDepartmentNamesandId();
  let uniqueInstructors =
    await courseDataFunctions.getUniqueInstructorNamesandId();
  uniqueDepartmentNames.sort((a, b) => a.name.localeCompare(b.name));
  uniqueInstructors.sort((a, b) => a.name.localeCompare(b.name));
  data.uniqueDepartmentNames = uniqueDepartmentNames;
  data.uniqueInstructors = uniqueInstructors;

  let uniqueSectionTypes = ["Online", "In-Person"];
  data.uniqueSectionTypes = uniqueSectionTypes;
  data.map((course) => {
    course.departmentName = course.departmentName[0];
  });
  res.render("courses/listings", {
    courses: data,
  });
});

export default router;

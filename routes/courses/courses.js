import { Router, query } from "express";
import verify, { santizeInputs } from "../../data_validation.js";
import * as courseDataFunctions from "../../data/courses/courses.js";
import util from "util";
import {
  validateCourse,
  validateSection,
} from "../../data/courses/courseHelper.js";

const router = Router();

router.get("/", async (req, res) => {
  let uniqueSectionYearandSemester =
    await courseDataFunctions.getUniqueSectionYearandSemester();
  let renderObjs = {
    session_name: req.session.name,
    session_type: req.session.type,
    session_email: req.session.email,
    uniqueYear: uniqueSectionYearandSemester[0],
    uniqueSemester: uniqueSectionYearandSemester[1],
    script: "courses/landing",
  };
  res.render("courses/landing", renderObjs);
});

router.get("/:year/:semester/registration", async (req, res) => {
  const { year, semester } = req.params;
  let uniqueDepartmentNames =
    await courseDataFunctions.getUniqueDepartmentNamesandId();
  let renderObjs = {
    session_name: req.session.name,
    session_type: req.session.type,
    session_email: req.session.email,
    uniqueDepartmentNames: uniqueDepartmentNames,
    year: year,
    semester: semester,
    script: "courses/registration",
  };
  res.render("courses/registration", renderObjs);
});

router.post("/registration", async (req, res) => {
  const {
    courseNumber,
    courseName,
    courseDepartmentId,
    courseCredits,
    courseDescription,
    courseSemester,
    courseYear,
  } = req.body;
  try {
    const course = validateCourse(
      courseNumber,
      courseName,
      courseDepartmentId,
      courseCredits,
      courseDescription,
      courseSemester,
      courseYear
    );
    let result = await courseDataFunctions.registerCourse(
      course.courseNumber,
      course.courseName,
      course.courseDepartmentId,
      course.courseCredits,
      course.courseDescription,
      course.courseSemester,
      course.courseYear
    );
    if (result.acknowledged) {
      // window.location.href = "/courses/" + result.insertedId;
      return res.json(result);
    }
  } catch (e) {
    if (e.status !== 500 && e.status) {
      return res.json({ error: e.message });
    } else {
      res.status(500);
      res.json({ error: "Login error" });
    }
  }
  // res.render("courses/registration");
});

router.get("/:courseId", async (req, res) => {
  const { courseId } = req.params;
  try {
    let userId = verify.validateMongoId(req.session.userid)
    let data = await courseDataFunctions.getCourseById(courseId);
    data.forEach((course) => {
      course.courseId = course._id.toString();
      course.sections.forEach((section) => {
        if (section.enrolledStudents?.some(studentId => studentId.equals(userId))) {
          section.isEnrolled = true;
        }
      });
    });
    let renderObjs = {
      userId: req.session.userid,
      session_name: req.session.name,
      session_type: req.session.type,
      session_email: req.session.email,
      courseId,
      courses: data,
      script: "courses/detail",
    };
    if (renderObjs.type === "Admin") {
      renderObjs.instructors =
        await courseDataFunctions.getUniqueInstructorNamesandId();
      renderObjs.instructors.sort((a, b) => a.name.localeCompare(b.name));
    }
    res.render("courses/detail", renderObjs);
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
  let renderObjs = {
    session_name: req.session.name,
    session_type: req.session.type,
    session_email: req.session.email,
    courses: data,
    script: "courses/listings",
  };
  res.render("courses/listings", renderObjs);
});

router.get("/:sectionId/enroll", async (req, res) => {
  const { sectionId } = req.params;
  try {
    await courseDataFunctions.enrollSection(sectionId, req.session.userid);
    res.json({ acknowledged: true });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.get("/:sectionId/discard", async (req, res) => {
  const { sectionId } = req.params;
  try {
    await courseDataFunctions.discardSection(sectionId, req.session.userid);
    res.json({ acknowledged: true });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

export default router;

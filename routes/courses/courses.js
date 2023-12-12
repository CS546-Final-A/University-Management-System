import { Router, query } from "express";
import { santizeInputs } from "../../data_validation.js";
import * as courseDataFunctions from "../../data/courses/courses.js";
import util from "util";
import { unsubscribe } from "diagnostics_channel";

const router = Router();
router.get("/", async (req, res) => {
  let uniqueSectionYearandSemester =
    await courseDataFunctions.getUniqueSectionYearandSemester();
  // console.log(
  //   util.inspect(
  //     uniqueSectionYearandSemester,
  //     false,
  //     null,
  //     true /* enable colors */
  //   )
  // );
  console.log("yes");
  res.render("courses/index", {
    uniqueYear: uniqueSectionYearandSemester[0],
    uniqueSemester: uniqueSectionYearandSemester[1],
  });
});

router.get("/:year/:semester/listings", async (req, res) => {
  const { year, semester } = req.params;

  console.log(year, semester);
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

  // // console.log(department);
  // console.log(instructors);

  data.uniqueDepartmentNames = uniqueDepartmentNames;
  data.uniqueInstructors = uniqueInstructors;

  let uniqueSectionTypes = ["Online", "In-Person"];
  data.uniqueSectionTypes = uniqueSectionTypes;
  data.map((course) => {
    course.departmentName = course.departmentName[0];
  });
  // console.log(util.inspect(data, false, null, true /* enable colors */));
  res.render("courses/listings", {
    courses: data,
  });
});

export default router;

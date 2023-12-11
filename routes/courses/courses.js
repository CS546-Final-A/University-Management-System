import { Router } from "express";
import { santizeInputs } from "../../data_validation.js";
import * as courseDataFunctions from "../../data/courses/courses.js";
import util from "util";
import { unsubscribe } from "diagnostics_channel";

const router = Router();

router.get("/listings", async (req, res) => {
  // req = santizeInputs(req);
  // console.log(req.body.data);
  let data = await courseDataFunctions.getAllCourses();
  console.log(util.inspect(data, false, null, true /* enable colors */));

  // Function to get unique values from an array
  const getUniqueValues = (array) => [...new Set(array.flat(Infinity))];
  data = data.filter((course) => course.sectionId.length > 0);
  // Extracting unique departmentName, Instructors, sectionDay, sectionType
  console.log(data);
  const uniqueDepartmentNames = getUniqueValues(
    data.map((course) => course.departmentName.toString())
  );
  console.log(uniqueDepartmentNames);
  const uniqueDays = getUniqueValues(data.map((course) => course.sectionDay));
  console.log(uniqueDays);

  const uniqueSectionTypes = getUniqueValues(
    data.map((course) => course.sectionType)
  );
  console.log(uniqueSectionTypes);
  res.render("courses/listings", { courses: data });
});

export default router;

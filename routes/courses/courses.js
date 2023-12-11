import { Router } from "express";
import { santizeInputs } from "../../data_validation.js";
import * as courseDataFunctions from "../../data/courses/courses.js";
import util from "util";
import { unsubscribe } from "diagnostics_channel";

const router = Router();

router.get("/listings", async (req, res) => {
  console.log("params is");
  console.log(req.query);

  let data = await courseDataFunctions.getAllCourses();
  // console.log(util.inspect(data, false, null, true /* enable colors */));

  // Function to get unique values from an array
  const getUniqueValues = (array) => [...new Set(array.flat(Infinity))];
  data = data.filter((course) => course.sectionId.length > 0);
  const uniqueDepartmentNames = getUniqueValues(
    data.map((course) => course.departmentName.toString())
  );
  const uniqueDays = getUniqueValues(data.map((course) => course.sectionDay));
  const uniqueSectionTypes = getUniqueValues(
    data.map((course) => course.sectionType)
  );

  data.uniqueDays = uniqueDays;
  data.uniqueDepartmentNames = uniqueDepartmentNames;
  data.uniqueSectionTypes = uniqueSectionTypes;
  console.log("data is");
  console.log(data);
  res.render("courses/listings", { courses: data });
});

export default router;

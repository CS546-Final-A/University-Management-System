import { Router, query } from "express";
import verify, { santizeInputs } from "../../data_validation.js";
import util from "util";
import {
  validateCourse,
  validateSection,
} from "../../data/courses/courseHelper.js";
import multer from "multer";
import filesPayloadExists from "../../routes/middleware/filesPayloadExists.js";
import fileExtLimiter from "../../routes/middleware/fileExtLimiter.js";
import fileSizesLimiter from "../../routes/middleware/fileSizeLimiter.js";
import * as courseDataFunctions from "../../data/courses/courses.js";
import { fileURLToPath } from "url";
import path from "path";
import { dirname } from "path";
import routeError from "../routeerror.js";
import fileUpload from "express-fileupload";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();
const upload = multer();
router.get("/", async (req, res) => {
  let uniqueSectionYearandSemester =
    await courseDataFunctions.getUniqueSectionYearandSemester();
  let renderObjs = {
    name: req.session.name,
    type: req.session.type,
    email: req.session.email,
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
    name: req.session.name,
    type: req.session.type,
    email: req.session.email,
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
    let userId = verify.validateMongoId(req.session.userid);
    let data = await courseDataFunctions.getCourseById(courseId);
    data.forEach((course) => {
      course.courseId = course._id.toString();
      course.sections.forEach((section) => {
        if (
          section.enrolledStudents?.some((studentId) =>
            studentId.equals(userId)
          )
        ) {
          section.isEnrolled = true;
        }
      });
    });
    let renderObjs = {
      userId: req.session.userid,
      name: req.session.name,
      type: req.session.type,
      email: req.session.email,
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
    name: req.session.name,
    type: req.session.type,
    email: req.session.email,
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

router.route("/:courseId/materials").get(async (req, res) => {
  const { courseId } = req.params;
  try {
    let userId = verify.validateMongoId(req.session.userid);
    let data = await courseDataFunctions.getCourseById(courseId);
    data.forEach((course) => {
      course.courseId = course._id.toString();
      course.sections.forEach((section) => {
        if (
          section.enrolledStudents?.some((studentId) =>
            studentId.equals(userId)
          )
        ) {
          section.isEnrolled = true;
        }
      });
    });

    let renderObjs = {
      userId: req.session.userid,
      name: req.session.name,
      type: req.session.type,
      email: req.session.email,
      courseId,
      courseName: data[0].courseName,
      courseDescription: data[0].courseDescription,
      sections: data[0].sections,
      headings: data[0].courseLearning.headings,
      files: data[0].courseLearning.files,
      // layout: "sidebar",
      // sectionID,
    };

    res.render("courses/materials", renderObjs);
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

router
  .route("/:courseId/materials/heading")
  .post(upload.none(), async (req, res) => {
    try {
      req.body = santizeInputs(req.body);
      let { courseId } = req.params;
      let userId = req.session.userid;
      userId = verify.validateMongoId(userId);
      courseId = verify.validateMongoId(courseId);
      await courseDataFunctions.addHeading(
        req.params.courseId,
        req.body.heading
      );
      res.status(200).json({ message: "Heading added successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

// Handling file uploads
router
  .route("/:courseId/materials/file")
  .post(
    fileUpload({ createParentPath: true }),
    filesPayloadExists,
    fileExtLimiter([".pdf"]),
    fileSizesLimiter,
    async (req, res) => {
      try {
        console.log(req.files);
        console.log(req.body.heading);

        const heading = req.body.heading;
        req.body = santizeInputs(req.body);

        const files = req.files;
        let { courseId } = req.params;
        let userId = req.session.userid;
        userId = verify.validateMongoId(userId);
        courseId = verify.validateMongoId(courseId);
        let fileName = "";
        let filepath = "";

        Object.keys(files).forEach((key) => {
          filepath = path.join(
            "files",
            "materials",
            courseId.toString(),
            heading,
            files[key].name
          );
          fileName = files[key].name;
          console.log(filepath);
          files[key].mv(filepath, (err) => {
            if (err)
              return res.status(500).json({ status: "error", message: err });
          });
        });

        await courseDataFunctions.addFileDetails(
          heading,
          fileName,
          filepath,
          courseId
        );

        res.status(200).json({ message: "file details added successfully" });
      } catch (error) {
        console.error(error);
        if (error.status !== 500 && error.status) {
          res
            .status(error.status)
            .json({ status: "Error", message: error.message });
        } else {
          res.status(500).json({ error: "Internal server error" });
        }
      }
    }
  );
router.get("/:courseId/materials/downloadFile", async (req, res) => {
  console.log(req);
  try {
    let courseId = req.params.courseId;
    courseId = verify.validateMongoId(courseId);
    const filePath = req.query.filePath;
    const fileName = req.query.fileName;
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.log(err);
        res.status(404).json({ error: "File not found" });
      }
    });
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

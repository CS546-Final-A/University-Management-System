import { Router, query } from "express";
import verify, { santizeInputs } from "../../data_validation.js";
import * as courseDataFunctions from "../../data/courses/courses.js";
import util from "util";
import {
  validateCourse,
  validateSection,
} from "../../data/courses/courseHelper.js";
import routeError from "../routeerror.js";
import fileUpload from "express-fileupload";
import { inflateRawSync } from "zlib";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const router = Router();
const upload = multer();
router.get("/", async (req, res) => {
  try {
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
  } catch (e) {
    routeError(res, e);
  }
});

router.get("/:year/:semester/registration", async (req, res) => {
  try {
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
  } catch (e) {
    routeError(res, e);
  }
});

router.post("/registration", async (req, res) => {
  try {
    const {
      courseNumber,
      courseName,
      courseDepartmentId,
      courseCredits,
      courseDescription,
      courseSemester,
      courseYear,
    } = req.body;
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
    } else {
      throw "Unexpected result";
    }
  } catch (e) {
    if (e.status !== 500 && e.status) {
      res.status(e.status);
      return res.json({ error: e.message });
    } else {
      res.status(500);
      res.json({ error: "Internal Server Error" });
    }
  }
  // res.render("courses/registration");
});

router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    let userId = verify.validateMongoId(req.session.userid);
    let data = await courseDataFunctions.getCourseById(courseId);
    data.forEach((course) => {
      course.courseId = course._id.toString();
      course.sections.forEach((section) => {
        if (section.students?.some((studentId) => studentId.equals(userId))) {
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
    if (renderObjs.session_type === "Admin") {
      renderObjs.instructors =
        await courseDataFunctions.getUniqueInstructorNamesandId();
      renderObjs.instructors.sort((a, b) => a.name.localeCompare(b.name));
    }
    res.render("courses/detail", renderObjs);
  } catch (e) {
    routeError(res, e);
  }
});

router.get("/:year/:semester/listings", async (req, res) => {
  try {
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
    data.found = data.length !== 0;

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
  } catch (e) {
    routeError(res, e);
  }
});

router.get("/:sectionId/enroll", async (req, res) => {
  try {
    const { sectionId } = req.params;
    await courseDataFunctions.enrollSection(sectionId, req.session.userid);
    res.json({ acknowledged: true });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.get("/:sectionId/discard", async (req, res) => {
  try {
    const { sectionId } = req.params;
    await courseDataFunctions.discardSection(sectionId, req.session.userid);
    res.json({ acknowledged: true });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post("/addSection/:courseId", async (req, res) => {
  try {
    let { courseId } = req.params;
    const {
      sectionName,
      sectionInstructor,
      sectionType,
      sectionStartTime,
      sectionEndTime,
      sectionDay,
      sectionCapacity,
      sectionLocation,
      sectionDescription,
    } = req.body;
    verify.validateMongoId(courseId, "courseId");
    const section = validateSection(
      sectionName,
      sectionInstructor,
      sectionType,
      sectionStartTime,
      sectionEndTime,
      sectionDay,
      sectionCapacity,
      sectionLocation,
      sectionDescription
    );
    const result = await courseDataFunctions.registerSection(
      courseId,
      section.sectionName,
      section.sectionInstructor,
      section.sectionType,
      section.sectionStartTime,
      section.sectionEndTime,
      section.sectionDay,
      section.sectionCapacity,
      section.sectionLocation,
      section.sectionDescription
    );

    if (result.acknowledged) {
      return res.json(result);
    }
  } catch (e) {
    if (e.status !== 500 && e.status) {
      res.status(e.status);
      return res.json({ error: e.message });
    } else {
      res.status(500);
      res.json({ error: "Internal Server Error" });
    }
  }
});

router.put("/editSection/:sectionId", async (req, res) => {
  try {
    const {
      sectionId,
      sectionName,
      sectionInstructor,
      sectionType,
      sectionStartTime,
      sectionEndTime,
      sectionDay,
      sectionCapacity,
      sectionLocation,
      sectionDescription,
    } = req.body;

    verify.validateMongoId(sectionId, "sectionId");
    let updateSection = validateSection(
      sectionName,
      sectionInstructor,
      sectionType,
      sectionStartTime,
      sectionEndTime,
      sectionDay,
      sectionCapacity,
      sectionLocation,
      sectionDescription
    );
    const updatedSection = await courseDataFunctions.updateSection(
      sectionId,
      updateSection.sectionName,
      sectionInstructor,
      updateSection.sectionType,
      updateSection.sectionStartTime,
      updateSection.sectionEndTime,
      updateSection.sectionDay,
      updateSection.sectionCapacity,
      updateSection.sectionLocation,
      updateSection.sectionDescription
    );
    return res.json(updatedSection);
  } catch (error) {
    if (error.status !== 500 && error.status) {
      return res.status(error.status).json({ error: error.message });
    } else {
      res.status(500);
      res.json({ error: "Internal Server Error" });
    }
  }
});

router.delete("/deleteSection/:sectionId", async (req, res) => {
  try {
    let sectionId = req.params.sectionId;
    const deleteInfo = await courseDataFunctions.deleteSection(sectionId);
    return res.json(deleteInfo);
  } catch (error) {
    if (error.status !== 500 && error.status) {
      return res.json({ error: error.message });
    } else {
      res.status(500);
      res.json({ error: "Internal Server Error" });
    }
  }
});

router.get("/getSectionById/:sectionId", async (req, res) => {
  try {
    let sectionId = req.params.sectionId;
    const section = await courseDataFunctions.getSectionById(sectionId);
    return res.json(section);
  } catch (error) {
    if (error.status !== 500 && error.status) {
      return res.json({ error: error.message });
    } else {
      res.status(500);
      res.json({ error: "Internal Server Error" });
    }
  }
});


router.use("/:courseId*", async (req, res, next) => {
  try {
    const { courseId } = req.params;
    let course = await courseDataFunctions.getCourseById(courseId);
    course = course[0];
    const userId = req.session.userid;
    if (!course) {
      throw { status: 404, message: "Course not found" };
    }

    let belongs = false;
    // console.log(course);
    if (course.sections.length > 0) {
      course.sections.forEach((section) => {
        if (
          section.students?.some(
            (studentId) => studentId.toString() === userId.toString()
          )
        ) {
          belongs = true;
        }
        if (section.sectionInstructor._id.toString() === userId.toString()) {
          belongs = true;
        }
      });
    }
    if (!belongs) {
      throw { status: 403, message: "You do not belong to this course" };
    }
    next();
  } catch (e) {
    routeError(res, e);
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
        if (section.students?.some((studentId) => studentId.equals(userId))) {
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
        // console.log(req.files);
        // console.log(req.body.heading);

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
          // console.log(filepath);
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
  try {
    let courseId = req.params.courseId;
    courseId = verify.validateMongoId(courseId);
    const filePath = req.query.filePath;
    const fileName = req.query.fileName;

    let course = await courseDataFunctions.getCourseById(courseId);
    course = course[0];
    const userId = req.session.userid;
    if (!course) {
      throw { status: 404, message: "Course not found" };
    }

    let belongs = false;
    // console.log(course);
    if (course.sections.length > 0) {
      course.sections.forEach((section) => {
        if (
          section.students?.some(
            (studentId) => studentId.toString() === userId.toString()
          )
        ) {
          belongs = true;
        }
        if (section.sectionInstructor._id.toString() === userId.toString()) {
          belongs = true;
        }
      });
    }
    if (!belongs) {
      throw { status: 403, message: "You do not belong to this course" };
    }
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.log(err);
        res.status(404).json({ error: "File not found" });
      }
    });
  } catch (e) {
    routeError(res, e);
  }
});

export default router;

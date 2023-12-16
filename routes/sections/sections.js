import { Router, query } from "express";
import {
  addStudentToAttendance,
  getAttendanceData,
} from "../../data/attendance/attendance.js";

import {
  addModuleToSection,
  getModuleById,
  uploadMaterial,
} from "../../data/modules/modules.js";

import getUserByID from "../../data/users/getUserInfoByID.js";
import fileUpload from "express-fileupload";
import path from "path";
import verify, { santizeInputs } from "../../data_validation.js";
import belongsincourse from "../../data/courses/belongsincourse.js";
import assignmentRoutes from "./assignments.js";
import {
  computeGradeByUserID,
  computeClassGrades,
} from "../../data/submissions/computeGrades.js";
import { getAssignmentsBySectionId } from "../../data/assignments/assignments.js";
import filesPayloadExists from "../../routes/middleware/filesPayloadExists.js";
import fileExtLimiter from "../../routes/middleware/fileExtLimiter.js";
import fileSizesLimiter from "../../routes/middleware/fileSizeLimiter.js";
import * as courseDataFunctions from "../../data/courses/courses.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import routeError from "../routeerror.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

router.use("/:sectionID*", async (req, res, next) => {
  res.locals.sectionID = req.params.sectionID;
  res.locals.layout = "sidebar";
  try {
    const sectionID = verify.validateMongoId(res.locals.sectionID, "SectionID");
    if (await belongsincourse(req.session.userid, sectionID)) {
      next();
    } else {
      res.status(403);
      res.render("public/error", {
        error: "You are not enrolled in this course",
      });
    }
  } catch (e) {
    if (e.status !== 500 && e.status) {
      res.status(e.status);
      return res.render("public/error", {
        error: e.message,
      });
    } else {
      console.log(e);
      res.status(500);
      return res.render("public/error", {
        error: "Internal Server Error",
      });
    }
  }
});

router.route("/:sectionId").get(async (req, res) => {
  let renderObjs = {};

  const section = await courseDataFunctions.getSectionById(
    res.locals.sectionID
  );
  const course = await courseDataFunctions.getCourseById(
    section.courseId.toString()
  );

  const profName = await getUserByID(section.sectionInstructor, {
    _id: 0,
    firstname: 1,
    lastname: 1,
  });

  renderObjs = {
    ...renderObjs,
    layout: "sidebar",
    sideBarTitle: course[0].courseName,
    courseId: section.courseId.toString(),
    courseName: course[0].courseName,
    sectionName: section.sectionName,
    sectionInstructor: section.sectionInstructor,
    fN: profName.firstname,
    lN: profName.lastname,
    sectionType: section.sectionType,
    sectionStartTime: section.sectionStartTime,
    sectionEndTime: section.sectionEndTime,
    sectionDay: section.sectionDay,
    sectionCapacity: section.sectionCapacity,
    sectionYear: section.sectionYear,
    sectionSemester: section.sectionSemester,
    studentCount: section.students.length,
    sectionLocation: section.sectionLocation,
    sectionDescription: section.sectionDescription,
  };
  res.render("workspace/home", renderObjs);
});

router.put("/:sectionId", async (req, res) => {
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

  try {
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

router.delete("/:sectionId", async (req, res) => {
  let sectionId = req.params.sectionId;
  try {
    const deleteInfo = await courseDataFunctions.deleteSection(sectionId);
    return res.json(deleteInfo);
  } catch (error) {
    if (error.status !== 500 && error.status) {
      return res.json({ error: error.message });
    } else {
      res.status(500);
      res.json({ error: "Login error" });
    }
  }
});

router.post("/:courseId/section", async (req, res) => {
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
  try {
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
      res.json({ error: "Login error" });
    }
  }
});

router
  .route("/:sectionId/modules")
  .get(async (req, res) => {
    let sectionId = verify.validateMongoId(req.params.sectionId);

    let renderObjs = {};
    const section = await courseDataFunctions.getSectionById(sectionId);
    const userType = req.session.type;

    renderObjs = {
      ...renderObjs,
      layout: "sidebar",
      // sideBarTitle: `${course.courseName}`,
      modules: section.sectionModules,
      userType,
    };
    res.render("workspace/module", renderObjs);
  })
  .post(async (req, res) => {
    req.body = santizeInputs(req.body);
    const { sectionId } = req.params;
    sectionId = verify.validateMongoId(req.params.sectionId);
    const { moduleName, moduleDescription, moduleDate } = req.body;
    try {
      await addModuleToSection(
        sectionId,
        moduleName,
        moduleDescription,
        moduleDate
      );

      res.status(200).json({ message: "module added successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Implementation of the Haversine formula
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1000; // Convert to meters
  return distance;
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

router
  .route("/:sectionId/modules/:moduleId/attendance")
  .get(async (req, res) => {
    let renderObjs = {};
    let { sectionId, moduleId } = req.params;
    let userId = req.session.userid;
    userId = verify.validateMongoId(userId);
    moduleId = verify.validateMongoId(moduleId);
    let section = await courseDataFunctions.checkStudentInSection(
      sectionId,
      userId
    );

    if (!section) {
      throw new Error("Section not found");
    }
    if (req.session.type === "Professor") {
      const userType = req.session.type;
      try {
        const attendanceData = await getAttendanceData(moduleId);
        console.log(attendanceData);

        const professor = await attendanceData.find(
          (entry) => entry.type === "Professor"
        );
        let needButton = true;
        if (professor) needButton = false;

        let studentsWithinRange = [];
        if (professor) {
          const professorLocation = {
            latitude: professor.latitude,
            longitude: professor.longitude,
          };

          if (attendanceData) {
            studentsWithinRange = attendanceData
              .filter((entry) => entry.type === "Student")
              .map((student) => {
                const studentLocation = {
                  latitude: student.latitude,
                  longitude: student.longitude,
                };
                const distance = calculateDistance(
                  professorLocation.latitude,
                  professorLocation.longitude,
                  studentLocation.latitude,
                  studentLocation.longitude
                );
                return {
                  name: student.name,
                  userId: student.userId,
                  distanceFromProfessor: distance,
                };
              })
              .filter((student) => student.distanceFromProfessor <= 20);
          }
        }
        if (studentsWithinRange) {
          const name = req.session.name;
          renderObjs = {
            ...renderObjs,
            layout: "sidebar",
            // sideBarTitle: `${course.courseName}`,
            userType,
            name,
            studentsWithinRange,
            needButton,
          };
          res.status(200).render("workspace/attendance", renderObjs);
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      const attendanceData = await getAttendanceData(moduleId);
      const professor = await attendanceData.find(
        (entry) => entry.type === "Professor"
      );
      let needButton = false;
      let n = 0;
      const userType = req.session.type;
      const name = req.session.name;
      if (!professor) {
        n = 1;
        renderObjs = {
          ...renderObjs,
          layout: "sidebar",
          // sideBarTitle: `${course.courseName}`,
          sectionID: sectionId,
          userType,
          name,
          n,
        };
        res.render("workspace/attendance", renderObjs);
      } else {
        const ts = professor.timeStamp;
        const date = new Date(ts);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let amOrPm = hours >= 12 ? "PM" : "AM";
        let H = hours;
        let M = minutes < 10 ? "0" + minutes : minutes;
        let k = amOrPm;
        const userFromDb = await attendanceData.find(
          (entry) => entry.userId === req.session.userid
        );
        let userThereButton = false;
        if (userFromDb) userThereButton = true;
        if (professor) needButton = true;
        let t = new Date();
        let timeLeft = t.getTime() - ts < 600000 ? true : false;
        if (needButton === false) n = 1;
        if (
          needButton === true &&
          userThereButton === false &&
          timeLeft === true
        )
          n = 2;
        if (
          needButton === true &&
          userThereButton === false &&
          timeLeft === false
        )
          n = 3;
        if (needButton === true && userThereButton === true) n = 4;
        renderObjs = {
          ...renderObjs,
          layout: "sidebar",
          // sideBarTitle: `${course.courseName}`,
          sectionID: sectionId,
          userType,
          name,
          n,
          H,
          M,
          k,
        };
        res.render("workspace/attendance", renderObjs);
      }
    }
  })
  .post(async (req, res) => {
    req.body = santizeInputs(req.body);
    const moduleId = req.params.moduleId;
    const userId = req.session.userid;
    const name = req.session.name;
    const type = req.session.type;
    const { latitude, longitude } = req.body;
    const attendanceData = await getAttendanceData(moduleId);
    const now = new Date();
    const timeStamp = now.getTime();

    const professor = await attendanceData.find(
      (entry) => entry.type === "Professor"
    );
    if (professor) {
      const d = calculateDistance(
        latitude,
        longitude,
        professor.latitude,
        professor.longitude
      );
      if (d > 0.1) alert("you'll be marked absent ");
    }
    try {
      await addStudentToAttendance(
        name,
        userId,
        moduleId,
        latitude,
        longitude,
        type,
        timeStamp
      );

      res.status(200).json({ message: "Attendance marked successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

router.post(
  "/:sectionId/modules/:moduleId/upload",
  fileUpload({ createParentPath: true }),
  filesPayloadExists,
  fileExtLimiter([".zip"]),
  fileSizesLimiter,

  async (req, res) => {
    try {
      req.body = santizeInputs(req.body);
      const files = req.files;
      let { sectionId, moduleId } = req.params;
      let userId = req.session.userid;
      userId = verify.validateMongoId(userId);
      moduleId = verify.validateMongoId(moduleId);
      let section = await courseDataFunctions.checkStudentInSection(
        sectionId,
        userId
      );

      if (!section) {
        throw new Error("Section not found");
      }

      let module = await getModuleById(moduleId);

      if (!module) {
        throw new Error("Assignment not found");
      }
      let fileName = "";
      Object.keys(files).forEach((key) => {
        const filepath = path.join(
          "files",
          moduleId.toString(),
          userId.toString(),
          files[key].name
        );
        fileName = files[key].name;
        console.log(filepath);
        files[key].mv(filepath, (err) => {
          if (err)
            return res.status(500).json({ status: "error", message: err });
        });
      });

      let material = await uploadMaterial(
        moduleId,
        Date.now().toString(),
        fileName
      );
      res.send({ status: "success", message: "File is uploaded" });
    } catch (e) {
      if (e.status !== 500 && e.status) {
        return res
          .status(e.status)
          .json({ status: "Error", message: e.message });
      } else {
        console.log(e);
        res.status(500);
        res.json({ error: "Login error" });
      }
    }
  }
);

router.get("/:sectionId/assignments/create", async (req, res) => {
  try {
    const sectionID = verify.validateMongoId(req.params.sectionID, "SectionID");
    if (await belongsincourse(req.session.userid, sectionID)) {
      next();
    } else {
      res.status(403);
      res.render("public/error", {
        error: "You are not enrolled in this course",
      });
    }
  } catch (e) {
    if (e.status !== 500 && e.status) {
      res.status(e.status);
      return res.render("public/error", {
        error: e.message,
      });
    } else {
      console.log(e);
      res.status(500);
      return res.render("public/error", {
        error: "Internal Server Error",
      });
    }
  }
});

async function renderStudentView(res, StudentID) {
  const assignments = await getAssignmentsBySectionId(res.locals.sectionID);
  const finalgrades = await computeGradeByUserID(
    res.locals.sectionID,
    StudentID
  );

  if (!assignments) {
    throw (
      "Assignments returned " +
      assignments +
      " which is not an expected return type"
    );
  }

  for (let assignment of assignments) {
    assignment.scores = assignment.scores.find((markObj) => {
      return markObj.studentId.toString() === StudentID;
    });
    if (!assignment.scores) {
      assignment.scores = "N/A";
    } else {
      assignment.scores = assignment.scores.score.toString();
    }
  }

  res.render("assignments/students/grades", {
    assignments: assignments,
    grades: finalgrades,
  });
}

router.use("/:sectionID/grades/:studentID", async (req, res) => {
  try {
    if (
      req.session.type === "Professor" ||
      req.session.userid === req.params.studentID
    ) {
      return await renderStudentView(res, req.params.studentID);
    } else {
      throw {
        status: 403,
        message: "You are not authorized to view that grade",
      };
    }
  } catch (e) {
    routeError(res, e);
  }
});

router.use("/:sectionID/grades", async (req, res) => {
  try {
    if (req.session.type === "Student") {
      return await renderStudentView(res, req.session.userid);
    } else {
      // Professor view
      const students = await computeClassGrades(res.locals.sectionID);
      res.render("assignments/professors/grades", { students: students });
    }
  } catch (e) {
    routeError(res, e);
  }
});

router.use("/:sectionID/assignments", assignmentRoutes);

export default router;

// router.get(
//   "/:sectionId/assignments/:assignmentId/submissions",
//   async (req, res) => {
//     try {
//       let renderObjs = {
//         name: req.session.name,
//         type: req.session.type,
//         email: req.session.email,
//         sectionId: res.locals.sectionID,
//         assignmentId: req.params.assignmentId,
//       };
//       let sectionId = res.locals.sectionID;
//       let assignmentId = req.params.assignmentId;
//       assignmentId = verify.validateMongoId(assignmentId);
//       let section = await courseDataFunctions.getSectionById(sectionId);
//       if (!section) {
//         throw new Error("Section not found");
//       }
//       renderObjs.section = section;
//       let assignment = await assignmentDataFunctions.getAssignmentById(
//         assignmentId
//       );
//       if (!assignment) {
//         throw new Error("Assignment not found");
//       }
//       renderObjs.assignment = assignment;
//       let submissions =
//         await assignmentDataFunctions.getSubmissionsByAssignmentId(
//           assignmentId
//         );
//       renderObjs.submissions = submissions;
//       res.render("assignments/submissions", renderObjs);
//     } catch (e) {
//       if (e.status !== 500 && e.status) {
//         return res.json({ error: e.message });
//       } else {
//         res.status(500);
//         res.json({ error: "Login error" });
//       }
//     }
//   }
// );

// router.get(
//   "/:sectionId/assignments/:assignmentId/submissions/:submissionId",
//   async (req, res) => {
//     try {
//       let renderObjs = {
//         name: req.session.name,
//         type: req.session.type,
//         email: req.session.email,
//         sectionId: res.locals.sectionID,
//         assignmentId: req.params.assignmentId,
//         submissionId: req.params.submissionId,
//       };
//       let sectionId = res.locals.sectionID;
//       let assignmentId = req.params.assignmentId;
//       let submissionId = req.params.submissionId;
//       assignmentId = verify.validateMongoId(assignmentId);
//       submissionId = verify.validateMongoId(submissionId);
//       let section = await courseDataFunctions.getSectionById(sectionId);
//       if (!section) {
//         throw new Error("Section not found");
//       }
//       renderObjs.section = section;
//       let assignment = await assignmentDataFunctions.getAssignmentById(
//         assignmentId
//       );
//       if (!assignment) {
//         throw new Error("Assignment not found");
//       }
//       renderObjs.assignment = assignment;
//       let submission = await assignmentDataFunctions.getSubmissionById(
//         submissionId
//       );
//       if (!submission) {
//         throw new Error("Submission not found");
//       }
//       renderObjs.submission = submission;
//       res.render("assignments/submission", renderObjs);
//     } catch (e) {
//       if (e.status !== 500 && e.status) {
//         return res.json({ error: e.message });
//       } else {
//         res.status(500);
//         res.json({ error: "Login error" });
//       }
//     }
//   }
// );

// router.get(
//   "/:sectionId/assignments/:assignmentId/submissions/:submissionId/download",
//   async (req, res) => {
//     try {
//       let sectionId = res.locals.sectionID;
//       let assignmentId = req.params.assignmentId;
//       let submissionId = req.params.submissionId;
//       assignmentId = verify.validateMongoId(assignmentId);
//       submissionId = verify.validateMongoId(submissionId);
//       let submission = await assignmentDataFunctions.getSubmissionById(
//         submissionId
//       );
//       if (!submission) {
//         throw new Error("Submission not found");
//       }
//       res.download(submission.filePath);
//     } catch (e) {
//       if (e.status !== 500 && e.status) {
//         return res.json({ error: e.message });
//       } else {
//         res.status(500);
//         res.json({ error: "Login error" });
//       }
//     }
//   }
// );

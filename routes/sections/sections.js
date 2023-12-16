import { Router, query } from "express";
import verify, { santizeInputs } from "../../data_validation.js";
import belongsincourse from "../../data/courses/belongsincourse.js";
import assignmentRoutes from "./assignments.js";
import { computeGradeByUserID } from "../../data/submissions/computeGrades.js";
import { getAssignmentsBySectionId } from "../../data/assignments/assignments.js";

import { fileURLToPath } from "url";
import { dirname } from "path";
import routeError from "../routeerror.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

router.get("/:sectionId", async (req, res) => {
  let sectionId = req.params.sectionId;
  try {
    const section = await courseDataFunctions.getSectionById(sectionId);
    return res.json(section);
  } catch (error) {
    if (e.status !== 500 && e.status) {
      return res.json({ error: e.message });
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

router.use("/:sectionID/grades", async (req, res) => {
  try {
    if (req.session.type !== "Student") {
      res.status(403);
      return res.render("public/error", {
        error: "You are not a student",
      });
    }
    const assignments = await getAssignmentsBySectionId(res.locals.sectionID);
    const finalgrades = await computeGradeByUserID(
      res.locals.sectionID,
      req.session.userid
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
        return markObj.studentId.toString() === req.session.userid;
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

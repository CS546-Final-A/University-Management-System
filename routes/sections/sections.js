import { Router, query } from "express";
import verify, { santizeInputs } from "../../data_validation.js";
import belongsincourse from "../../data/courses/belongsincourse.js";
import assignmentRoutes from "./assignments.js";
import {
  computeGradeByUserID,
  computeClassGrades,
} from "../../data/submissions/computeGrades.js";
import { getAssignmentsBySectionId } from "../../data/assignments/assignments.js";

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

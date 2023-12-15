import { Router } from "express";
import util from "util";
const router = Router();
import * as assignmentDataFunctions from "../../data/assignments/assignments.js";
import * as courseDataFunctions from "../../data/courses/courses.js";
import routeError from "../routeerror.js";
import verify, { santizeInputs } from "../../data_validation.js";
import { validateAssignment } from "../../data/assignments/assignmentsHelper.js";

import fileUpload from "express-fileupload";
import path from "path";
import filesPayloadExists from "../../routes/middleware/filesPayloadExists.js";
import fileExtLimiter from "../../routes/middleware/fileExtLimiter.js";
import fileSizesLimiter from "../../routes/middleware/fileSizeLimiter.js";

router.get("/create", async (req, res) => {
  try {
    let renderObjs = {};
    //TODO: get all the assignments for this section and pass it to the renderObjs
    let section = await courseDataFunctions.getSectionById(
      res.locals.sectionID
    );

    if (!section) {
      throw new Error("Section not found");
    }

    res.render("assignments/create", renderObjs);
  } catch (e) {
    routeError(res, e);
  }
});

router.post("/create", async (req, res) => {
  req.body = santizeInputs(req.body);
  const sectionId = res.locals.sectionID;
  let userId = req.session.userid;
  const {
    assignmentName,
    assignmentDescription,
    assignmentWeight,
    assignmentDueDate,

    submissionLimit,

    assignmentMaxScore,
  } = req.body;
  try {
    const assignment = validateAssignment(
      userId,
      assignmentName,
      assignmentDescription,
      assignmentWeight,
      assignmentDueDate,
      sectionId,
      submissionLimit,
      assignmentMaxScore
    );
    let result = await assignmentDataFunctions.createAssignment(
      assignment.userId,
      assignment.assignmentName,
      assignment.assignmentDescription,
      assignment.assignmentWeight,
      assignment.assignmentDueDate,
      assignment.assignmentSectionId,
      assignment.submissionLimit,
      assignment.assignmentMaxScore
    );
    if (result == "success") {
      res.redirect("/sections/" + sectionId + "/assignments");
    }
  } catch (e) {
    routeError(res, e);
  }
});

router.use("/:action/:assignmentID*", async (req, res, next) => {
  try {
    res.locals.assignmentID = verify.validateMongoId(req.params.assignmentID);
    res.locals.assignment = await assignmentDataFunctions.getAssignmentById(
      res.locals.assignmentID
    );

    if (!res.locals.assignment) {
      throw { status: 404, message: "Assignment not found" };
    }
    next();
  } catch (e) {
    routeError(res, e);
  }
});

router.get("/edit/:assignmentID", async (req, res) => {
  try {
    if (req.session.type !== "Professor") {
      throw {
        status: 403,
        message: "You do not have edit rights for this assignment",
      };
    }
    res.render("assignments/edit");
  } catch (e) {
    routeError(res, e);
  }
});
router.get("/edit/:assignmentID/", async (req, res) => {
  try {
    let renderObjs = {};
    let sectionId = res.locals.sectionID;
    let assignmentID = res.locals.assignmentID;
    assignmentID = verify.validateMongoId(assignmentID);
    let section = await courseDataFunctions.getSectionById(sectionId);
    if (!section) {
      throw new Error("Section not found");
    }
    renderObjs.section = section;
    let assignment = await assignmentDataFunctions.getAssignmentById(
      assignmentID
    );
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    res.render("assignments/edit", renderObjs);
  } catch (e) {
    routeError(res, e);
  }
});

router.post("/edit/:assignmentID/", async (req, res) => {
  req.body = santizeInputs(req.body);
  const sectionId = res.locals.sectionID;
  const assignmentID = res.locals.assignmentID;
  let userId = req.session.userid;
  const {
    assignmentName,
    assignmentDescription,
    assignmentWeight,
    assignmentDueDate,

    submissionLimit,

    assignmentMaxScore,
  } = req.body;
  try {
    const assignment = validateAssignment(
      userId,
      assignmentName,
      assignmentDescription,
      assignmentWeight,
      assignmentDueDate,
      sectionId,
      submissionLimit,
      assignmentMaxScore
    );
    let result = await assignmentDataFunctions.updateAssignment(
      assignmentID,
      assignment
    );

    res.redirect(
      "/sections/" + sectionId + "/assignments/" + assignmentID + "/"
    );
  } catch (e) {
    routeError(res, e);
  }
});

router.get("/delete/:assignmentID/", async (req, res) => {
  try {
    let sectionId = res.locals.sectionID;
    let assignmentID = res.locals.assignmentID;
    assignmentID = verify.validateMongoId(assignmentID);
    let section = await courseDataFunctions.getSectionById(sectionId);
    if (!section) {
      throw new Error("Section not found");
    }
    let assignment = await assignmentDataFunctions.getAssignmentById(
      assignmentID
    );
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    let result = await assignmentDataFunctions.deleteAssignmentById(
      assignmentID
    );

    res.redirect("/sections/" + sectionId + "/assignments");
  } catch (e) {
    routeError(res, e);
  }
});
router.get("/view/:assignmentID/submit", async (req, res) => {
  try {
    let renderObjs = {};
    let sectionId = res.locals.sectionID;
    let assignmentID = res.locals.assignmentID;
    let userId = req.session.userid;
    userId = verify.validateMongoId(userId);
    assignmentID = verify.validateMongoId(assignmentID);
    let section = await courseDataFunctions.checkStudentInSection(
      sectionId,
      userId
    );

    if (!section) {
      throw new Error("Section not found");
    }

    let assignment = await assignmentDataFunctions.getAssignmentById(
      assignmentID
    );

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    res.render("assignments/submit", renderObjs);
  } catch (e) {
    routeError(res, e);
  }
});

router.post(
  "/view/:assignmentID/submit",

  fileUpload({ createParentPath: true }),
  filesPayloadExists,
  fileExtLimiter([".zip"]),
  fileSizesLimiter,

  async (req, res) => {
    try {
      req.body = santizeInputs(req.body);
      const sectionId = res.locals.sectionID;
      const assignmentID = res.locals.assignmentID;
      let userId = req.session.userid;

      const files = req.files;

      userId = verify.validateMongoId(userId);
      assignmentID = verify.validateMongoId(assignmentID);
      let section = await courseDataFunctions.checkStudentInSection(
        sectionId,
        userId
      );

      if (!section) {
        throw new Error("Section not found");
      }

      let assignment = await assignmentDataFunctions.getAssignmentById(
        assignmentID
      );

      if (!assignment) {
        throw new Error("Assignment not found");
      }
      let fileName = "";
      Object.keys(files).forEach((key) => {
        const filepath = path.join(
          "files",
          "Assignments",
          assignmentID.toString(),
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

      let submission = await assignmentDataFunctions.submitAssignment(
        assignmentID,
        userId,
        Date.now().toString(),
        fileName
      );
      res.send({ status: "success", message: "File is uploaded" });
    } catch (e) {
      routeError(res, e);
    }
  }
);

function groupSubmissionsByStudentId(submissions) {
  const groupedSubmissions = {};

  submissions.forEach((submission) => {
    const studentId = submission.studentId;
    submission.submissionDate = new Date(submission.submissionDate);

    if (!groupedSubmissions[studentId]) {
      groupedSubmissions[studentId] = [];
    }

    groupedSubmissions[studentId].push(submission);
  });

  return groupedSubmissions;
}

router.get("/view/:assignmentID/submissions", async (req, res) => {
  try {
    let renderObjs = {};
    let sectionId = res.locals.sectionID;
    let assignmentID = res.locals.assignmentID;
    assignmentID = verify.validateMongoId(assignmentID);
    let section = await courseDataFunctions.getSectionById(sectionId);
    if (!section) {
      throw new Error("Section not found");
    }
    renderObjs.section = section;
    let assignment = await assignmentDataFunctions.getAssignmentById(
      assignmentID
    );
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    renderObjs.assignment = assignment;
    renderObjs.submissions = groupSubmissionsByStudentId(
      assignment.submissions
    );
    console.log(renderObjs.submissions);
    res.render("assignments/submissions", renderObjs);
  } catch (e) {
    routeError(res, e);
  }
});

function getScore(scores, studentId) {
  if (!scores) return null;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i].studentId.toString() == studentId.toString()) {
      return scores[i].score;
    }
  }
  return null;
}

router.get("/view/:assignmentID/scores", async (req, res) => {
  try {
    let renderObjs = {};

    let sectionId = res.locals.sectionID;
    let assignmentID = res.locals.assignmentID;

    assignmentID = verify.validateMongoId(assignmentID);

    let section = await courseDataFunctions.getSectionById(sectionId);
    if (!section) {
      throw new Error("Section not found");
    }

    renderObjs.section = section;
    renderObjs.sectionId = sectionId.toString();
    let assignment = await assignmentDataFunctions.getAssignmentById(
      assignmentID
    );
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    assignment._id = assignment._id.toString();
    renderObjs.assignment = assignment;

    let allStudents = await courseDataFunctions.getStudentsInSection(sectionId);
    let submissions = assignment.submissions;

    // Group submissions by student ID
    let groupedSubmissions = groupSubmissionsByStudentId(submissions);
    let scores = assignment.scores;

    // Create a list of all students with or without submissions
    renderObjs.students = allStudents.map((student) => {
      return {
        _id: student.studentId.toString(),
        name: student.firstname + " " + student.lastname,
        submissions: groupedSubmissions[student.studentId] || [],
        score: getScore(scores, student.studentId),
      };
    });
    console.log(util.inspect(renderObjs, { depth: Infinity }));
    res.render("assignments/scores", renderObjs);
  } catch (e) {
    routeError(res, e);
  }
});

router.post("/view/:assignmentID/scores", async (req, res) => {
  let sectionId = res.locals.sectionID;
  let assignmentID = res.locals.assignmentID;
  let { studentId, score } = req.body;

  try {
    // Validate the score
    // Ensure that you have a function to validate the score in your data functions
    score = parseFloat(score);
    score = verify.rationalNumber(score);
    studentId = verify.validateMongoId(studentId);
    assignmentID = verify.validateMongoId(assignmentID);
    // Validate and update the score in the database
    // Ensure that you have a function to update the score in your data functions
    let result = await assignmentDataFunctions.updateSubmissionScore(
      assignmentID,
      studentId,
      score
    );

    res.redirect(`/sections/${sectionId}/assignments/${assignmentID}/scores`);
  } catch (e) {
    routeError(res, e);
  }
});

router.get("/view/:assignmentID", async (req, res) => {
  try {
    let renderObjs = {};
    let assignmentID = res.locals.assignmentID;
    assignmentID = verify.validateMongoId(assignmentID);
    let assignment = await assignmentDataFunctions.getAssignmentById(
      assignmentID
    );
    if (!assignment) {
      throw new Error("Assignment not found");
    }

    renderObjs.assignment = assignment;

    res.render("assignments/view", renderObjs);
  } catch (e) {
    routeError(res, e);
  }
});

router.get("/", async (req, res) => {
  try {
    let renderObjs = {};
    let sectionId = res.locals.sectionID;
    sectionId = verify.validateMongoId(sectionId);
    let section = await courseDataFunctions.getSectionById(sectionId);
    if (!section) {
      throw new Error("Section not found");
    }
    renderObjs.section = section;
    let assignments = await assignmentDataFunctions.getAssignmentsBySectionId(
      sectionId
    );
    renderObjs.assignments = assignments;
    res.render("assignments/list", renderObjs);
  } catch (e) {
    routeError(res, e);
  }
});

export default router;

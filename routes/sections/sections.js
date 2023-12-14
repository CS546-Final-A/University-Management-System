import { Router, query } from "express";
import verify, { santizeInputs } from "../../data_validation.js";
import * as assignmentDataFunctions from "../../data/assignments/assignments.js";
import * as courseDataFunctions from "../../data/courses/courses.js";
import util from "util";
import {
  validateCourse,
  validateSection,
} from "../../data/courses/courseHelper.js";
import { validateAssignment } from "../../data/assignments/assignmentsHelper.js";
const router = Router();

router.get("/:sectionId/assignments/create", async (req, res) => {
  try {
    let renderObjs = {
      name: req.session.name,
      type: req.session.type,
      email: req.session.email,
      sectionId: req.params.sectionId,
    };
    //TODO: get all the assignments for this section and pass it to the renderObjs
    let section = await courseDataFunctions.getSectionById(
      req.params.sectionId
    );

    if (!section) {
      throw new Error("Section not found");
    }

    res.render("assignments/create", renderObjs);
  } catch (e) {
    if (e.status !== 500 && e.status) {
      return res.json({ error: e.message });
    } else {
      res.status(500);
      res.json({ error: "Login error" });
    }
  }
});

router.post("/:sectionId/assignments/create", async (req, res) => {
  req.body = santizeInputs(req.body);
  const { sectionId } = req.params;
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
      res.redirect("/courses/sections/" + sectionId + "/assignments");
    }
  } catch (e) {
    if (e.status !== 500 && e.status) {
      return res.json({ error: e.message });
    } else {
      console.log(e);
      res.status(500);
      res.json({ error: "Login error" });
    }
  }
});

router.get("/:sectionId/assignments/:assignmentId", async (req, res) => {
  try {
    let renderObjs = {
      name: req.session.name,
      type: req.session.type,
      email: req.session.email,
      sectionId: req.params.sectionId,
      assignmentId: req.params.assignmentId,
    };
    let sectionId = req.params.sectionId;
    let assignmentId = req.params.assignmentId;
    assignmentId = verify.validateMongoId(assignmentId);

    let assignment = await assignmentDataFunctions.getAssignmentById(
      assignmentId
    );
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    renderObjs.assignment = assignment;

    res.render("assignments/view", renderObjs);
  } catch (e) {
    if (e.status !== 500 && e.status) {
      return res.json({ error: e.message });
    } else {
      res.status(500);
      res.json({ error: "Login error" });
    }
  }
});

router.get("/:sectionId/assignments", async (req, res) => {
  try {
    let renderObjs = {
      name: req.session.name,
      type: req.session.type,
      email: req.session.email,
      sectionId: req.params.sectionId,
    };
    let sectionId = req.params.sectionId;
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
    if (e.status !== 500 && e.status) {
      return res.json({ error: e.message });
    } else {
      res.status(500);
      res.json({ error: "Login error" });
    }
  }
});

router.get("/:sectionId/assignments/edit/:assignmentId/", async (req, res) => {
  try {
    let renderObjs = {
      name: req.session.name,
      type: req.session.type,
      email: req.session.email,
      sectionId: req.params.sectionId,
      assignmentId: req.params.assignmentId,
    };
    let sectionId = req.params.sectionId;
    let assignmentId = req.params.assignmentId;
    assignmentId = verify.validateMongoId(assignmentId);
    let section = await courseDataFunctions.getSectionById(sectionId);
    if (!section) {
      throw new Error("Section not found");
    }
    renderObjs.section = section;
    let assignment = await assignmentDataFunctions.getAssignmentById(
      assignmentId
    );
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    renderObjs.assignment = assignment;
    res.render("assignments/edit", renderObjs);
  } catch (e) {
    if (e.status !== 500 && e.status) {
      return res.json({ error: e.message });
    } else {
      res.status(500);
      res.json({ error: "Login error" });
    }
  }
});
export default router;

router.post("/:sectionId/assignments/edit/:assignmentId/", async (req, res) => {
  req.body = santizeInputs(req.body);
  const { sectionId, assignmentId } = req.params;
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
      assignmentId,
      assignment
    );

    res.redirect("/sections/" + sectionId + "/assignments");
  } catch (e) {
    if (e.status !== 500 && e.status) {
      return res.json({ error: e.message });
    } else {
      console.log(e);
      res.status(500);
      res.json({ error: "Login error" });
    }
  }
});

router.get(
  "/:sectionId/assignments/delete/:assignmentId/",
  async (req, res) => {
    try {
      let sectionId = req.params.sectionId;
      let assignmentId = req.params.assignmentId;
      assignmentId = verify.validateMongoId(assignmentId);
      let section = await courseDataFunctions.getSectionById(sectionId);
      if (!section) {
        throw new Error("Section not found");
      }
      let assignment = await assignmentDataFunctions.getAssignmentById(
        assignmentId
      );
      if (!assignment) {
        throw new Error("Assignment not found");
      }
      let result = await assignmentDataFunctions.deleteAssignmentById(
        assignmentId
      );

      res.redirect("/sections/" + sectionId + "/assignments");
    } catch (e) {
      if (e.status !== 500 && e.status) {
        return res.json({ error: e.message });
      } else {
        console.log(e);
        res.status(500);
        res.json({ error: "Login error" });
      }
    }
  }
);

// router.get(
//   "/:sectionId/assignments/:assignmentId/submissions",
//   async (req, res) => {
//     try {
//       let renderObjs = {
//         name: req.session.name,
//         type: req.session.type,
//         email: req.session.email,
//         sectionId: req.params.sectionId,
//         assignmentId: req.params.assignmentId,
//       };
//       let sectionId = req.params.sectionId;
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
//         sectionId: req.params.sectionId,
//         assignmentId: req.params.assignmentId,
//         submissionId: req.params.submissionId,
//       };
//       let sectionId = req.params.sectionId;
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
//       let sectionId = req.params.sectionId;
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

import { Router, query } from "express";
import verify, { santizeInputs } from "../../data_validation.js";
import * as assignmentDataFunctions from "../../data/assignments/assignments.js";
import * as courseDataFunctions from "../../data/courses/courses.js";

import util from "util";
import {
  validateCourse,
  validateSection,
} from "../../data/courses/courseHelper.js";
import fileUpload from "express-fileupload";
import path from "path";
import filesPayloadExists from "../../routes/middleware/filesPayloadExists.js";
import fileExtLimiter from "../../routes/middleware/fileExtLimiter.js";
import fileSizesLimiter from "../../routes/middleware/fileSizeLimiter.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

    res.redirect(
      "/sections/" + sectionId + "/assignments/" + assignmentId + "/"
    );
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

router.get("/:sectionId/assignments/:assignmentId/submit", async (req, res) => {
  try {
    let renderObjs = {
      name: req.session.name,
      type: req.session.type,
      email: req.session.email,
    };
    let sectionId = req.params.sectionId;
    let assignmentId = req.params.assignmentId;
    let userId = req.session.userid;
    userId = verify.validateMongoId(userId);
    assignmentId = verify.validateMongoId(assignmentId);
    let section = await courseDataFunctions.checkStudentInSection(
      sectionId,
      userId
    );

    if (!section) {
      throw new Error("Section not found");
    }

    let assignment = await assignmentDataFunctions.getAssignmentById(
      assignmentId
    );

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    renderObjs.assignment = assignment;
    res.render("assignments/submit", renderObjs);
  } catch (e) {
    if (e.status !== 500 && e.status) {
      return res.json({ error: e.message });
    } else {
      res.status(500);
      res.json({ error: "Login error" });
    }
  }
});

router.post(
  "/:sectionId/assignments/:assignmentId/submit",
  fileUpload({ createParentPath: true }),
  filesPayloadExists,
  fileExtLimiter([".zip"]),
  fileSizesLimiter,

  async (req, res) => {
    try {
      req.body = santizeInputs(req.body);
      let { sectionId, assignmentId } = req.params;
      let userId = req.session.userid;

      const files = req.files;

      userId = verify.validateMongoId(userId);
      assignmentId = verify.validateMongoId(assignmentId);
      let section = await courseDataFunctions.checkStudentInSection(
        sectionId,
        userId
      );

      if (!section) {
        throw new Error("Section not found");
      }

      let assignment = await assignmentDataFunctions.getAssignmentById(
        assignmentId
      );

      if (!assignment) {
        throw new Error("Assignment not found");
      }
      let fileName = "";
      Object.keys(files).forEach((key) => {
        const filepath = path.join(
          "files",
          assignmentId.toString(),
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
        assignmentId,
        userId,
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

router.get(
  "/:sectionId/assignments/:assignmentId/submissions",
  async (req, res) => {
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
      renderObjs.submissions = groupSubmissionsByStudentId(
        assignment.submissions
      );
      console.log(renderObjs.submissions);
      res.render("assignments/submissions", renderObjs);
    } catch (e) {
      if (e.status !== 500 && e.status) {
        return res.json({ error: e.message });
      } else {
        res.status(500);
        res.json({ error: "Login error" });
      }
    }
  }
);

function groupSubmissionsByStudentId(submissions) {
  const groupedSubmissions = {};

  submissions.forEach((submission) => {
    const studentId = submission.studentId;

    if (!groupedSubmissions[studentId]) {
      groupedSubmissions[studentId] = [];
    }

    groupedSubmissions[studentId].push(submission);
  });

  return groupedSubmissions;
}

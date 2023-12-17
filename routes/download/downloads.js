import fileUpload from "express-fileupload";
import path from "path";
import { Router, query } from "express";
import fs from "fs";

import verify, { santizeInputs } from "../../data_validation.js";

import * as assignmentDataFunctions from "../../data/assignments/assignments.js";
import routeError from "../routeerror.js";
const router = Router();

router.get(
  "/assignments/:assignmentId/submissions/:submissionId",
  async (req, res) => {
    try {
      let submissionId = req.params.submissionId;
      let assignmentId = req.params.assignmentId;
      assignmentId = verify.validateMongoId(assignmentId);
      submissionId = verify.validateMongoId(submissionId);

      const assignment = await assignmentDataFunctions.getAssignmentById(
        assignmentId
      );

      const submission = await assignmentDataFunctions.getSubmissionById(
        submissionId
      );

      if (!assignment || !submission) {
        throw { status: 404, message: "Submission not found" };
      }

      let isTeacher = assignment.userId == req.session.userid;
      let isStudent = submission.studentId == req.session.userid;
      if (!isTeacher && !isStudent) {
        const e = {
          status: 403,
          message: "You are not allowed to download this submission ",
        };
        throw e;
      }

      const submissionPath = path.join(
        "files",
        assignmentId.toString(),
        submission.studentId.toString(),
        submission.file
      );

      if (fs.existsSync(submissionPath)) {
        res.download(submissionPath, submission.filename, (err) => {
          if (err) {
            console.log(err);
          }
        });
      } else {
        // Server error because files should exist if submitted
        const e = {
          status: 500,
          message: "Submission file not found",
        };
        throw e;
      }
    } catch (e) {
      routeError(res, e);
    }
  }
);
export default router;

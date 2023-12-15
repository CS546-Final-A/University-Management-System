import fileUpload from "express-fileupload";
import path from "path";
import { Router, query } from "express";

import verify, { santizeInputs } from "../../data_validation.js";

import * as assignmentDataFunctions from "../../data/assignments/assignments.js";
const router = Router();

router.get(
  "/assignments/:assignmentId/submissions/:submissionId",
  async (req, res) => {
    console.log(req);
    try {
      let submissionId = req.params.submissionId;
      let assignmentId = req.params.assignmentId;
      assignmentId = verify.validateMongoId(assignmentId);
      submissionId = verify.validateMongoId(submissionId);

      const submission = await assignmentDataFunctions.getSubmissionById(
        submissionId
      );

      const submissionPath = path.join(
        "files",
        assignmentId.toString(),
        submission.studentId.toString(),
        submission.file
      );

      res.download(submissionPath, submission.filename, (err) => {
        if (err) {
          console.log(err);
        }
      });
    } catch (e) {
      res.status(404).json({ error: "Submission not found" });
    }
  }
);
export default router;

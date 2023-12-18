import SMTPConnect from "../../config/smptConnection.js";

import verify from "../../data_validation.js";
import getUserByID from "../users/getUserInfoByID.js";

async function sendSubmissionReceipt(
  userId,
  submissionId,
  fileName,
  assignment
) {
  userId = verify.validateMongoId(userId);
  submissionId = verify.validateMongoId(submissionId);

  const user = await getUserByID(userId, { _id: 0, email: 1 });
  const emailer = await SMTPConnect();

  const message = {
    from: `assignments@${process.env.MailServerDomain}`,
    to: user.email,
    subject: `Assignment Submitted`,
    text: `This is your confirmation that ${
      assignment.assignmentName
    } has been successfully submitted.
    
    Submission receipt:
    Submission ID: ${submissionId.toString()}
    Submission File: ${fileName}
    Submission Time: ${new Date().toString()} 
    `,
    html: `
    <!doctype html>
    <html>
        <body>
            <h4>
            This is your confirmation that ${
              assignment.assignmentName
            } has been successfully submitted.
            </h4>
            <br>
            <p>
            Submission receipt:<br>
            Submission ID: ${submissionId.toString()}<br>
            Submission File: <a href="javascript:void(0);" style="cursor: default;text-decoration: none;">${fileName}</a><br>
            Submission Time: ${new Date().toString()}<br>
            </p>
        </body>
    </html>
    `,
  };

  let messagesent;
  try {
    messagesent = await emailer.sendMail(message);
  } catch (e) {
    // Throw only the response message
    const error = { status: 500, message: e.response };
    throw error;
  }
  if (messagesent.rejected.length) {
    const error = { status: 400, message: "Email rejected" };
    throw error;
  }
  return messagesent;
}

export default sendSubmissionReceipt;

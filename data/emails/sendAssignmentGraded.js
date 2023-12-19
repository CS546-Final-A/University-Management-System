import SMTPConnect from "../../config/smptConnection.js";

import verify from "../../data_validation.js";
import getUserByID from "../users/getUserInfoByID.js";

async function sendAssignmentGraded(userId, assignmentName) {
  userId = verify.validateMongoId(userId);

  const user = await getUserByID(userId, { _id: 0, email: 1 });
  const emailer = await SMTPConnect();

  const message = {
    from: `assignments@${process.env.MailServerDomain}`,
    to: user.email,
    subject: `Assignment Graded`,
    text: `Your grade for assignment ${assignmentName} has been updated.`,
    html: `
    <!doctype html>
    <html>
        <body>
            Your grade for assignment ${assignmentName} has been updated.
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

export default sendAssignmentGraded;

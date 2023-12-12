import { passwordresets, users } from "../../config/mongoCollections.js";
import verify from "../../data_validation.js";

import sendPasswordResetEmail from "../emails/sendPasswordResetEmail.js";

async function initiatePasswordReset(email) {
  email = verify.email(email);

  const usercol = await users();
  const resetscol = await passwordresets();

  const user = await usercol.findOne(
    { email: email },
    { projection: { _id: 1 } }
  );

  if (!user) {
    // Hide the fact that no such user exists from client
    return { successful: true };
  }

  const recentTime = new Date();
  recentTime.setMinutes(-30);

  const existingreset = await resetscol.findOne({
    userid: user._id,
    requesttime: { $gte: recentTime, $lte: new Date() },
  });

  if (existingreset) {
    // Do not resend email if a reset has already been requested
    return { successful: true };
  }

  const insertion = await resetscol.insertOne({
    userid: user._id,
    requesttime: new Date(),
  });
  if (!insertion.acknowledged || !insertion.insertedId) {
    // Move to catch
    const error = { status: 500, message: "Database insertion error" };
    throw error;
  }

  try {
    await sendPasswordResetEmail(email, insertion.insertedId);
    return { successful: true };
  } catch (e) {
    // Clean up
    await resetscol.deleteOne({ _id: insertion.insertedId });
    throw e;
  }
}

export default initiatePasswordReset;

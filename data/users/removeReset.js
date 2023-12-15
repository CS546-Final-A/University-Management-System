import { passwordresets } from "../../config/mongoCollections.js";
import verify from "../../data_validation.js";

async function removeReset(id) {
  id = verify.validateMongoId(id, "PasswordResetID");

  const resetscol = await passwordresets();

  const result = await resetscol.deleteOne({ _id: id });

  if (!result.acknowledged) {
    throw { status: 500, message: "Database error" };
  }

  if (result.deletedCount != 1) {
    throw { status: 404, message: "Reset not found" };
  }

  return result;
}

export default removeReset;

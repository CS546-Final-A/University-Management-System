import { passwordresets } from "../../config/mongoCollections.js";
import verify from "../../data_validation.js";

async function getPasswordResetInfo(id) {
  id = verify.validateMongoId(id);

  const resetscol = await passwordresets();

  const recentTime = new Date();
  recentTime.setMinutes(-30);

  const reset = await resetscol.findOne({
    _id: id,
    requesttime: { $gte: recentTime, $lte: new Date() },
  });

  if (!reset) {
    throw { status: 404, message: "No active reset found for user" };
  }

  return reset;
}

export default getPasswordResetInfo;

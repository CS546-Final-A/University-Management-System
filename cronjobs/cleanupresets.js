import { passwordresets } from "../config/mongoCollections.js";

async function cleanup() {
  const resetscol = await passwordresets();

  const recentTime = new Date();
  recentTime.setMinutes(recentTime.getMinutes() - 30);

  const result = await resetscol.deleteMany({
    $or: [
      { requesttime: { $lt: recentTime } },
      { requesttime: { $gt: new Date() } },
    ],
  });

  if (!result.acknowledged) {
    throw "Database Error";
  }
  return `Successfully cleaned up expired password rest requests deleting a total of ${result.deletedCount} records`;
}

export default cleanup;

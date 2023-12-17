import { users } from "../../config/mongoCollections.js";
import verify from "../../data_validation.js";

export async function setTheme(id, darkmode) {
  id = verify.validateMongoId(id, "User");

  const userCollection = await users();

  const result = await userCollection.updateOne(
    { _id: id },
    {
      $set: {
        "preferences.darkmode": darkmode,
      },
    }
  );

  if (!result.acknowledged) {
    throw { status: 500, message: "Database error" };
  }

  return result;
}

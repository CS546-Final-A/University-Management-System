import { ObjectId } from "mongodb";
import hash from "../hashPassword.js";

import { users } from "../../config/mongoCollections.js";
import verify from "../../data_validation.js";

async function setPassword(id, password) {
  try {
    new ObjectId(id);
  } catch {
    throw { status: 400, message: "Invalid UserID" };
  }

  password = await hash(verify.password(password));

  const usercol = await users();
  const result = await usercol.updateOne(
    { _id: new ObjectId(id), status: { $not: { $eq: "Disabled" } } },
    {
      $set: { password: password, status: "Active" },
      $unset: { registrationcode: "" },
    }
  );

  if (!result.acknowledged) {
    throw { status: 500, message: "Database error when setting user password" };
  }
  if (!result.matchedCount === 1) {
    throw { status: 404, message: "No such user" };
  }

  return result;
}

export default setPassword;

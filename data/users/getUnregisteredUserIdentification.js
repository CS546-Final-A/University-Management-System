import { users } from "../../config/mongoCollections.js";
import { ObjectId } from "mongodb";

async function getUserByID(id) {
  try {
    new ObjectId(id);
  } catch {
    throw { status: 400, message: "Invalid registration link" };
  }

  const usercol = await users();
  const result = await usercol.findOne(
    { _id: new ObjectId(id), status: "Initalized" },
    { projection: { _id: 0, identification: 1 } }
  );

  if (!result) {
    throw { status: 404, message: "Invalid registration link" };
  }

  return result.identification;
}

export default getUserByID;

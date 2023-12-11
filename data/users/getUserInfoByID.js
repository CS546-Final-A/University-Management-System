import { users } from "../../config/mongoCollections.js";
import { ObjectId } from "mongodb";

async function getUserByID(id, projection) {
  try {
    new ObjectId(id);
  } catch {
    throw { status: 400, message: "Invalid UserID" };
  }

  if (typeof projection !== "object" && projection) {
    throw { status: 500, message: "Invalid projection object" };
  }

  const usercol = await users();
  let result;
  if (projection) {
    result = await usercol.findOne(
      {
        _id: new ObjectId(id),
      },
      { projection: projection }
    );
  } else {
    result = await usercol.findOne({
      _id: new ObjectId(id),
    });
  }

  if (!result) {
    throw { status: 404, message: "No such user" };
  }

  return result;
}

export default getUserByID;

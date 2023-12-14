import { users } from "../../config/mongoCollections.js";
import verify from "../../data_validation.js";

async function getRegistrationInfo(registrationcode) {
  registrationcode = verify.UUID(registrationcode);

  const usercol = await users();
  const result = await usercol.findOne(
    { registrationcode: registrationcode, status: "Initalized" },
    { projection: { _id: 1, identification: 1 } }
  );

  if (!result) {
    throw { status: 404, message: "Invalid registration link" };
  }

  return result;
}

export default getRegistrationInfo;

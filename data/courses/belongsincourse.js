import verify from "../../data_validation.js";
import getUserByID from "../users/getUserInfoByID.js";
import { getSectionById } from "./courses.js";

async function belongsincourse(userid, sectionid) {
  userid = verify.validateMongoId(userid);
  sectionid = verify.validateMongoId(sectionid);
  const section = await getSectionById(sectionid);

  if (!section) {
    throw { status: 404, message: "Invalid section" };
  }

  if (section.sectionInstructor.toString() === userid.toString()) {
    return true;
  }

  const usercourses = await getUserByID(userid, {
    _id: 0,
    registeredCourses: 1,
  });

  return usercourses.registeredCourses.includes(sectionid.toString());
}

export default belongsincourse;

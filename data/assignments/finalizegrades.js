import { finalgrades } from "../../config/mongoCollections.js";
import verify from "../../data_validation.js";

async function getgrade(sectionID, userID) {
  sectionID = verify.validateMongoId(sectionID);
  userID = verify.validateMongoId(userID);
  const gradecol = await finalgrades();

  const grade = await gradecol.findOne(
    {
      userID: userID,
      sectionID: sectionID,
    },
    { _id: 0, grade: 1 }
  );
  if (grade) {
    return grade.grade;
  } else {
    return grade;
  }
}

async function setgrade(sectionID, userID, grade) {
  sectionID = verify.validateMongoId(sectionID);
  userID = verify.validateMongoId(userID);
  grade = verify.letterGrade(grade);
  const existinggrade = await getgrade(sectionID, userID);
  if (existinggrade) {
    throw { status: 400, message: "A grade for this user is already set" };
  }
  const gradecol = await finalgrades();

  const result = await gradecol.insertOne({
    userID: userID,
    sectionID: sectionID,
    grade: grade,
  });

  if (!result.acknowledged || !result.insertedId) {
    throw { status: 500, message: "Insertion error on finals grades" };
  }
  return result;
}

export { getgrade, setgrade };

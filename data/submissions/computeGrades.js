import { users, assignments } from "../../config/mongoCollections.js";
import verify from "../../data_validation.js";

function gradeForStudent(studentid, assignmentdata) {
  let score = 0;
  let maxscore = 0;

  for (let assignment of assignmentdata) {
    const mark = assignment.scores.find((markObj) => {
      return markObj.studentId === studentid;
    });
    if (mark) {
      score = score + assignment.assignmentWeight * mark.score;
      maxscore =
        maxscore + assignment.assignmentWeight * assignment.assignmentMaxScore;
    }
  }
  return (score / maxscore) * 100;
}

async function computeGradeByUserID(sectiondID, studentid) {
  sectiondID = verify.validateMongoId(sectiondID);
  studentid = verify.validateMongoId(studentid);

  const assignmentcol = await assignments();

  const assignmentdata = await assignmentcol
    .find(
      {},
      {
        projection: {
          _id: 0,
          scores: 1,
          assignmentWeight: 1,
          assignmentMaxScore: 1,
        },
      }
    )
    .toArray();

  return gradeForStudent(studentid, assignmentdata);
}

async function computeClassGrades(sectiondID) {
  sectiondID = verify.validateMongoId(sectiondID);

  const usercol = await users();
  const assignmentcol = await assignments();

  const students = await usercol
    .find(
      {
        registeredCourses: sectiondID.toString(),
      },
      { projection: { _id: 1 } }
    )
    .toArray();

  const assignmentdata = await assignmentcol
    .find(
      {},
      {
        projection: {
          _id: 0,
          scores: 1,
          assignmentWeight: 1,
          assignmentMaxScore: 1,
        },
      }
    )
    .toArray();

  const classgrades = {};

  for (let student of students) {
    classgrades[student._id] = gradeForStudent(student._id, assignmentdata);
  }

  return classgrades;
}

export { computeGradeByUserID, computeClassGrades };

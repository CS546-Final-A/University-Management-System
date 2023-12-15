import { users, assignments } from "../../config/mongoCollections.js";
import { verify } from "../../data_validation.js";

function gradeForStudent(studentid, assignmentdata) {
  let marks = 0;
  let maxmarks = 0;

  for (let assignment of assignmentdata) {
    const score = assignment.marks.find((markObj) => {
      return markObj.studentId === studentid;
    });
    if (score) {
      marks = marks + assignment.assignmentWeight * score.score;
    }
    maxmarks =
      maxmarks + assignment.assignmentWeight * assignment.assignmentMaxScore;
  }
  return (marks / maxmarks) * 100;
}

async function computeGradeByUserID(sectiondID, studentid) {
  sectiondID = verify.validateMongoId(sectiondID);
  studentid = verify.validateMongoId(studentid);

  const assignmentcol = await assignments();

  const assignmentdata = await assignmentcol.findMany(
    {},
    {
      projection: {
        _id: 0,
        marks: 1,
        assignmentWeight: 1,
        assignmentMaxScore: 1,
      },
    }
  );

  return gradeForStudent(studentid, assignmentdata);
}

async function computeClassGrades(sectiondID) {
  sectiondID = verify.validateMongoId(sectiondID);

  const usercol = await users();
  const assignmentcol = await assignments();

  const students = await usercol.findMany(
    {
      registeredCourses: sectiondID.toString(),
    },
    { projection: { _id: 1 } }
  );

  const assignmentdata = await assignmentcol.findMany(
    {},
    {
      projection: {
        _id: 0,
        marks: 1,
        assignmentWeight: 1,
        assignmentMaxScore: 1,
      },
    }
  );

  const classgrades = {};

  for (let student of students) {
    classgrades[student._id] = gradeForStudent(student._id, assignmentdata);
  }

  return classgrades;
}

export { computeGradeByUserID, computeClassGrades };

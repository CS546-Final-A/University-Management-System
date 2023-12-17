import { users, assignments } from "../../config/mongoCollections.js";
import { getgrade } from "../assignments/finalizegrades.js";
import verify from "../../data_validation.js";

function letterGrade(score) {
  if (score === "N/A") {
    return "N/A";
  }
  if (score < 60) {
    return "F";
  } else if (score < 70) {
    return "D";
  } else if (score < 74) {
    return "C-";
  } else if (score < 77) {
    return "C";
  } else if (score < 80) {
    return "C+";
  } else if (score < 84) {
    return "B-";
  } else if (score < 87) {
    return "B";
  } else if (score < 90) {
    return "B+";
  } else if (score < 94) {
    return "A-";
  } else {
    return "A";
  }
}

function gradeForStudent(studentid, assignmentdata) {
  let score = 0;
  let maxscore = 0;

  for (let assignment of assignmentdata) {
    const mark = assignment.scores.find((markObj) => {
      return markObj.studentId.toString() === studentid.toString();
    });
    if (mark) {
      score = score + assignment.assignmentWeight * mark.score;
      maxscore =
        maxscore + assignment.assignmentWeight * assignment.assignmentMaxScore;
    }
  }
  if (maxscore === 0) {
    return "N/A";
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

  const grade = { grade: gradeForStudent(studentid, assignmentdata) };

  grade.letterGrade = letterGrade(grade.grade);

  return grade;
}

async function computeClassGrades(sectiondID) {
  sectiondID = verify.validateMongoId(sectiondID);

  const usercol = await users();
  const assignmentcol = await assignments();

  const students = await usercol
    .find(
      {
        type: "Student",
        registeredCourses: sectiondID.toString(),
      },
      { projection: { _id: 1, firstname: 1, lastname: 1 } }
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

  for (let student of students) {
    student.grade = gradeForStudent(student._id, assignmentdata);
    student.lettergrade = letterGrade(student.grade);
    student.finalgrade = await getgrade(sectiondID, student._id);
  }

  return students;
}

export { computeGradeByUserID, computeClassGrades };

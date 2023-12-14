import {
  departments,
  courses,
  users,
  assignments,
} from "../../config/mongoCollections.js";
import verify, {
  throwErrorWithStatus,
  throwerror,
} from "../../data_validation.js";

import { validateAssignment } from "../../data/assignments/assignmentsHelper.js";
import { ObjectId } from "mongodb";

export async function createAssignment(
  userId,
  assignmentName,
  assignmentDescription,
  assignmentWeight,
  assignmentDueDate,
  assignmentSectionId,
  submissionLimit,

  assignmentMaxScore
) {
  userId = verify.validateMongoId(userId, "userId");
  //   check if sectionInstructor is the same as the user id

  const courseCollection = await courses();
  let assignmentValidated = validateAssignment(
    userId,
    assignmentName,
    assignmentDescription,
    assignmentWeight,
    assignmentDueDate,
    assignmentSectionId,
    submissionLimit,
    assignmentMaxScore
  );

  const course = await courseCollection.findOne({
    sections: {
      $elemMatch: { sectionId: assignmentSectionId, sectionInstructor: userId },
    },
  });

  if (!course) {
    throwerror(
      "Invalid section id given or sectionInstructor does not match with userId provided",
      400
    );
  }
  assignmentValidated.submissions = [];
  const assignmentCollection = await assignments();

  const insertInfo = await assignmentCollection.insertOne(assignmentValidated);

  if (insertInfo.insertedCount === 0) throw "Could not add assignment";
  const newId = insertInfo.insertedId;

  const sectionInsert = await courseCollection.updateOne(
    { "sections.sectionId": assignmentSectionId },
    { $addToSet: { "sections.$.assignments": newId } }
  );

  if (!sectionInsert.matchedCount && !sectionInsert.modifiedCount) {
    throw "Could not update section with assignment";
  }

  const assignmentObj = await getAssignmentById(newId);

  if (!assignmentObj) throwerror("Assignment not found", 404);

  return "success";
}

export async function getAssignmentById(assignmentId) {
  assignmentId = verify.validateMongoId(assignmentId, "assignmentId");

  const assignmentCollection = await assignments();
  const assignment = await assignmentCollection.findOne({
    _id: assignmentId,
  });

  if (!assignment) {
    throwerror("Assignment not found", 404);
  }

  assignment._id = assignment._id.toString();
  assignment.assignmentSectionId = assignment.assignmentSectionId.toString();

  return assignment;
}

export async function getAssignmentsBySectionId(sectionId) {
  sectionId = verify.validateMongoId(sectionId, "sectionId");

  const courseCollection = await courses();
  const section = await courseCollection.findOne(
    {
      sections: {
        $elemMatch: { sectionId: sectionId },
      },
    },
    { $match: { "sections.sectionId": sectionId } }
  );

  if (!section) {
    throwErrorWithStatus(400, "Invalid section id");
  }

  const assignmentIds = section.sections[0].assignments;

  if (!assignmentIds) {
    return [];
  }

  const assignmentCollection = await assignments();
  const assignmentList = await assignmentCollection
    .find({ _id: { $in: assignmentIds } })
    .toArray();

  if (!assignmentList) {
    throwerror("Assignments not found", 404);
  }

  for (let i = 0; i < assignmentList.length; i++) {
    assignmentList[i]._id = assignmentList[i]._id.toString();
    assignmentList[i].assignmentSectionId =
      assignmentList[i].assignmentSectionId.toString();
  }

  return assignmentList;
}

export async function updateAssignment(assignmentId, updatedAssignmentData) {
  assignmentId = verify.validateMongoId(assignmentId, "assignmentId");

  const assignmentCollection = await assignments();
  const updatedAssignment = await assignmentCollection.findOneAndUpdate(
    { _id: assignmentId },
    { $set: updatedAssignmentData },
    { returnOriginal: false }
  );

  if (!updatedAssignment) {
    throwerror("Assignment not found", 404);
  }

  updatedAssignment._id = updatedAssignment._id.toString();
  updatedAssignment.assignmentSectionId =
    updatedAssignment.assignmentSectionId.toString();

  return updatedAssignment;
}

// ...

const updatedData = {
  assignmentName: "Updated Assignment 1",
  assignmentDescription: "Updated Assignment 1 Description",
  assignmentWeight: 15,
  assignmentMaxScore: 100,
  assignmentDueDate: "2024-10-15",
  assignmentSectionId: "657639234daa9f93cf1ecac0",
  submissionLimit: 10,
};

// await updateAssignment("657a4ebfb0ac71b2041be093", updatedData).then(
//   (updatedAssignment) => console.log(updatedAssignment)
// );

// ...

export async function deleteAssignmentById(assignmentId) {
  assignmentId = verify.validateMongoId(assignmentId, "assignmentId");

  const assignmentCollection = await assignments();
  const assignment = await getAssignmentById(assignmentId);

  let sectionId = assignment.assignmentSectionId;

  sectionId = verify.validateMongoId(sectionId, "sectionId");

  const courseCollection = await courses();
  const section = await courseCollection.findOne({
    sections: {
      $elemMatch: { sectionId: sectionId },
    },
  });

  const sectionAssignments = section.sections[0].assignments;

  const sectionInsert = await courseCollection.updateOne(
    { "sections.sectionId": sectionId },
    { $pull: { "sections.$.assignments": assignmentId } }
  );

  if (!sectionInsert.matchedCount && !sectionInsert.modifiedCount) {
    throw "Could not update section by removing assignment";
  }

  const deletionInfo = await assignmentCollection.deleteOne({
    _id: assignmentId,
  });

  if (deletionInfo.deletedCount === 0) {
    throw `Could not delete assignment with id of ${assignmentId}`;
  }

  return assignmentId;
}

// ...

// await deleteAssignment("657a43ee83fa3564e5fd8ca3").then((deletedAssignmentId) =>
//   console.log(deletedAssignmentId)
// );

// ...

export async function getAllAssignmentsBySectionId(sectionId) {
  sectionId = verify.validateMongoId(sectionId, "sectionId");

  const assignmentCollection = await assignments();
  const assignmentList = await assignmentCollection
    .find({ assignmentSectionId: sectionId })
    .toArray();

  if (!assignmentList) {
    throwerror("Assignments not found", 404);
  }

  for (let i = 0; i < assignmentList.length; i++) {
    assignmentList[i]._id = assignmentList[i]._id.toString();
    assignmentList[i].assignmentSectionId =
      assignmentList[i].assignmentSectionId.toString();
  }

  return assignmentList;
}

// ...

// await getAllAssignmentsBySectionId("657639234daa9f93cf1ecac0").then(
//   (assignments) => console.log(assignments)
// );

export async function submitAssignment(assignmentId, studentId, file) {
  assignmentId = verify.validateMongoId(assignmentId, "assignmentId");
  studentId = verify.validateMongoId(studentId, "studentId");

  const assignmentCollection = await assignments();

  const assignment = await assignmentCollection.findOne({
    _id: assignmentId,
    submissions: {
      $elemMatch: { studentId: studentId },
    },
  });

  if (!assignment) {
    throwerror("Assignment not found", 404);
  }

  if (assignment.submissions.length > 0) {
    assignment.submissions = assignment.submissions.filter((submission) => {
      submission.studentId === studentId;
    });
  }

  if (assignment.submissionLimit) {
    if (assignment.submissions.length >= assignment.submissionLimit) {
      throwerror("Submission limit reached", 400);
    }
  }

  const submission = {
    studentId: studentId,
    file: file,
    submissionDate: Date.now(),
  };

  const submissionInsert = await assignmentCollection.updateOne(
    { _id: assignmentId },
    { $addToSet: { submissions: submission } }
  );

  if (!submissionInsert.matchedCount && !submissionInsert.modifiedCount) {
    throw "Could not update assignment with submission";
  }

  return submission;
}

export async function getAssignmentSubmissions(assignmentId) {
  assignmentId = verify.validateMongoId(assignmentId, "assignmentId");

  const assignmentCollection = await assignments();
  const assignment = await assignmentCollection.findOne({
    _id: assignmentId,
  });

  if (!assignment) {
    throwerror("Assignment not found", 404);
  }

  return assignment.submissions;
}

export async function getAssignmentSubmissionByStudent(
  assignmentId,
  studentId
) {
  assignmentId = verify.validateMongoId(assignmentId, "assignmentId");
  studentId = verify.validateMongoId(studentId, "studentId");

  const assignmentCollection = await assignments();
  const assignment = await assignmentCollection.findOne({
    _id: assignmentId,
    submissions: {
      $elemMatch: { studentId: studentId },
    },
  });

  if (!assignment) {
    throwerror("Assignment not found", 404);
  }

  const submission = assignment.submissions.filter((submission) => {
    submission.studentId === studentId;
  });

  return submission;
}

export async function deleteAssignmentSubmission(assignmentId, studentId) {
  assignmentId = verify.validateMongoId(assignmentId, "assignmentId");
  studentId = verify.validateMongoId(studentId, "studentId");

  const assignmentCollection = await assignments();
  const assignment = await assignmentCollection.findOne({
    _id: assignmentId,
    submissions: {
      $elemMatch: { studentId: studentId },
    },
  });

  if (!assignment) {
    throwerror("Assignment not found", 404);
  }

  const submission = assignment.submissions.filter((submission) => {
    submission.studentId === studentId;
  });

  const submissionInsert = await assignmentCollection.updateOne(
    { _id: assignmentId },
    { $pull: { submissions: submission } }
  );

  if (!submissionInsert.matchedCount && !submissionInsert.modifiedCount) {
    throw "Could not update assignment with submission";
  }

  return submission;
}

export async function addScoreToSubmission(assignmentId, studentId, score) {
  assignmentId = verify.validateMongoId(assignmentId, "assignmentId");
  studentId = verify.validateMongoId(studentId, "studentId");

  const assignmentCollection = await assignments();
  const assignment = await assignmentCollection.findOne({
    _id: assignmentId,
    submissions: {
      $elemMatch: { studentId: studentId },
    },
  });

  if (!assignment) {
    throwerror("Assignment not found", 404);
  }

  const submission = assignment.submissions.filter((submission) => {
    submission.studentId === studentId;
  });

  const submissionInsert = await assignmentCollection.updateOne(
    { studentId: studentId },
    { $set: { "submissions.$.score": score } }
  );

  if (!submissionInsert.matchedCount && !submissionInsert.modifiedCount) {
    throw "Could not update assignment with submission";
  }

  return submission;
}

export async function getAssignmentScore(assignmentId, studentId) {
  assignmentId = verify.validateMongoId(assignmentId, "assignmentId");
  studentId = verify.validateMongoId(studentId, "studentId");

  const assignmentCollection = await assignments();
  const assignment = await assignmentCollection.findOne({
    _id: assignmentId,
    submissions: {
      $elemMatch: { studentId: studentId },
    },
  });

  if (!assignment) {
    throwerror("Assignment not found", 404);
  }

  const submission = assignment.submissions.filter((submission) => {
    submission.studentId === studentId;
  });
  if (!submission.score) throwerror("Score not found", 404);
  return submission.score;
}

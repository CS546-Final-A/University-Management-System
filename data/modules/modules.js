import { courses } from "../../config/mongoCollections.js";
import { ObjectId } from "mongodb";
export async function addModuleToSection(
  sectionId,
  moduleName,
  moduleDescription,
  moduleDate
) {
  try {
    const coursesCollection = await courses();
    const newModuleId = new ObjectId();
    const attendance = [];
    const newModule = {
      moduleId: newModuleId,
      moduleName,
      moduleDescription,
      moduleDate,
      attendance,
    };

    const result = await coursesCollection.updateOne(
      { "sections.sectionId": new ObjectId(sectionId) },
      {
        $push: {
          "sections.$.sectionModules": newModule,
        },
      }
    );

    if (result.modifiedCount === 1) {
      console.log(`Module added to section ${sectionId} successfully.`);
      return newModuleId;
    } else {
      console.log(`Failed to add module to section ${sectionId}.`);
      return null;
    }
  } catch (error) {
    console.error("Error adding module to section:", error);
    throw new Error("Failed to add module to section");
  }
}

export async function getModuleById(moduleId) {
  moduleId = verify.validateMongoId(moduleId, "moduleId");

  const coursesCollection = await courses();
  const module = await coursesCollection.findOne({
    _id: moduleId,
  });

  if (!module) {
    throwErrorWithStatus(400, "Module not found");
  }

  module._id = module._id.toString();

  return module;
}

export async function uploadMaterial(moduleId, materialdesc, file) {
  moduleId = verify.validateMongoId(moduleId, "moduleId");

  const coursesCollection = await courses();

  const module = await coursesCollection.findOne({
    _id: moduleId,
  });

  if (!module) {
    throwErrorWithStatus(400, "Module not found");
  }
  let submissionArray;
  if (assignment.submissions.length > 0) {
    submissionArray = assignment.submissions.filter((submission) => {
      return submission.studentId.toString() == studentId.toString();
    });
  }

  if (assignment.submissionLimit) {
    if (submissionArray.length >= assignment.submissionLimit) {
      throwErrorWithStatus(400, "Submission limit reached", 400);
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

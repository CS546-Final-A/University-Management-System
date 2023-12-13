import { sections } from "../../config/mongoCollections.js";
import { ObjectId } from "mongodb";

// Named export for the first function
export async function addStudentToAttendance(userId, moduleId) {
  const sectionsCollection = await sections();

  const result = await sectionsCollection.updateOne(
    {
      "sectionModules.moduleId": new ObjectId(moduleId),
    },
    {
      $addToSet: {
        "sectionModules.$.attendance": userId,
      },
    }
  );

  if (result.modifiedCount === 1) {
    console.log(
      `User with ID ${userId} added to attendance for module ${moduleId} successfully.`
    );
  } else {
    console.log(`User with ID ${userId} was not added to attendance. `);
  }
}

// Named export for the second function
export async function getAttendanceData(sectionId, moduleId) {
  const sectionsCollection = await sections();

  try {
    const section = await sectionsCollection.findOne(
      {
        _id: new ObjectId(sectionId),
        "sectionModules.moduleId": new ObjectId(moduleId),
      },
      {
        projection: {
          "sectionModules.$": 1,
        },
      }
    );

    if (
      !section ||
      !section.sectionModules ||
      section.sectionModules.length === 0
    ) {
      throw new Error("Section or module not found");
    }

    const attendance = section.sectionModules[0].attendance || [];

    return attendance;
  } catch (error) {
    console.error("Error retrieving attendance data:", error);
    throw error;
  }
}

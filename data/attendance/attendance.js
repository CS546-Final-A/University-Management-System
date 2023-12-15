import { courses } from "../../config/mongoCollections.js";
import { ObjectId } from "mongodb";

export async function addStudentToAttendance(
  name,
  userId,
  moduleId,
  latitude,
  longitude,
  type
) {
  try {
    const coursesCollection = await courses();

    const result = await coursesCollection.updateOne(
      {
        "sections.sectionModules": {
          $elemMatch: {
            moduleId: new ObjectId(moduleId),
            "attendance.userId": { $ne: userId },
          },
        },
      },
      {
        $push: {
          "sections.$[section].sectionModules.$[module].attendance": {
            name,
            userId,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            type,
          },
        },
      },
      {
        arrayFilters: [
          { "section.sectionModules.moduleId": new ObjectId(moduleId) },
          { "module.attendance.userId": { $ne: userId } },
        ],
        upsert: true,
      }
    );

    if (result.modifiedCount === 1 || result.upsertedCount === 1) {
      console.log(
        `User with ID ${userId} added to attendance for module ${moduleId} successfully.`
      );
    } else {
      console.log(`User with ID ${userId} was not added to attendance.`);
    }
  } catch (error) {
    console.error("Error adding student to course attendance:", error);
    throw new Error("Failed to add student to course attendance");
  }
}

export async function getAttendanceData(moduleId) {
  try {
    const coursesCollection = await courses();

    const attendanceData = await coursesCollection
      .aggregate([
        {
          $match: {
            "sections.sectionModules.moduleId": new ObjectId(moduleId),
          },
        },
        { $unwind: "$sections" },
        { $unwind: "$sections.sectionModules" },
        {
          $match: {
            "sections.sectionModules.moduleId": new ObjectId(moduleId),
          },
        },
        {
          $project: {
            _id: 0,
            attendance: "$sections.sectionModules.attendance",
          },
        },
      ])
      .toArray();

    if (attendanceData.length > 0) {
      return attendanceData[0].attendance || [];
    } else {
      console.log(`Attendance data not found for module ${moduleId}.`);
      return [];
    }
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    throw new Error("Failed to retrieve attendance data");
  }
}

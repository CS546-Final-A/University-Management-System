import verify, { throwErrorWithStatus } from "../../data_validation.js";
import { ObjectId } from "mongodb";

export const validateCourse = (
  courseNumber,
  courseName,
  courseDepartmentId,
  courseCredits,
  courseDescription,
  courseSemester,
  courseYear,
) => {
  if (
    !courseNumber ||
    !courseName ||
    !courseDepartmentId ||
    !courseCredits ||
    !courseDescription
  ) {
    throwErrorWithStatus(400, "Missing inputs");
  }

  courseNumber = verify.numberInteger(courseNumber, "courseNumber");
  courseName = verify.isAlphaString(courseName, "courseName");
  courseDepartmentId = verify.validateMongoId(
    courseDepartmentId,
    "courseDepartmentId"
  );
  courseCredits = verify.numberInteger(courseCredits, "courseCredits");
  courseDescription = verify.string(courseDescription, "courseDescription");
  courseSemester = verify.semester(courseSemester, "courseSemester");
  courseYear = verify.year(courseYear, "courseYear");

  return {
    courseNumber,
    courseName,
    courseDepartmentId,
    courseCredits,
    courseDescription,
    courseSemester,
    courseYear,
  };
};

export const validateSection = (
  sectionName,
  sectionInstructor,
  sectionType,
  sectionStartTime,
  sectionEndTime,
  sectionDay,
  sectionCapacity,
  sectionLocation,
  sectionDescription
) => {
  if (
    !sectionName |
    !sectionInstructor |
    !sectionType |
    !sectionStartTime |
    !sectionEndTime |
    !sectionDay |
    !sectionCapacity |
    !sectionLocation |
    !sectionDescription
  ) {
    throwErrorWithStatus(400, "Missing inputs");
  }

  sectionName = verify.isAlphaString(sectionName, "sectionName");
  sectionInstructor = verify.validateMongoId(sectionInstructor, "sectionInstructor");
  sectionType = verify.sectionType(sectionType);
  sectionStartTime = verify.time(sectionStartTime, "sectionStartTime");
  sectionEndTime = verify.time(sectionEndTime, "sectionEndTime");
  sectionDay = verify.day(sectionDay, "sectionDay");
  sectionCapacity = verify.numberInteger(sectionCapacity, "sectionCapacity");
  sectionLocation = verify.string(sectionLocation, "sectionLocation");
  sectionDescription = verify.string(sectionDescription, "sectionDescription");

  return {
    sectionName,
    sectionInstructor,
    sectionType,
    sectionStartTime,
    sectionEndTime,
    sectionDay,
    sectionCapacity,
    sectionLocation,
    sectionDescription,
  };
};

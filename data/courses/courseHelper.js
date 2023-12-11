import verify, { throwErrorWithStatus } from "../../data_validation.js";
import { ObjectId } from "mongodb";

export const validateCourse = (
  courseNumber,
  courseName,
  courseDepartmentId,
  courseCredits,
  courseDescription
) => {
  if (
    !courseNumber ||
    !courseName ||
    !courseDepartmentId ||
    !courseCredits ||
    !courseDescription
  ) {
    throwErrorWithStatus(400, "Missing parameters");
  }

  courseNumber = verify.numberInteger(courseNumber, "courseNumber");
  courseName = verify.isAlphaString(courseName, "courseName");
  courseDepartmentId = verify.validateMongoId(
    courseDepartmentId,
    "courseDepartmentId"
  );
  courseCredits = verify.numberInteger(courseCredits, "courseCredits");
  courseDescription = verify.string(courseDescription, "courseDescription");

  return {
    courseNumber,
    courseName,
    courseDepartmentId,
    courseCredits,
    courseDescription,
  };
};

export const validateSection = (
  sectionName,
  sectionType,
  sectionStartTime,
  sectionEndTime,
  sectionDay,
  sectionCapacity,
  sectionYear,
  sectionSemester,
  sectionLocation,
  sectionDescription
) => {
  if (
    !sectionName |
    !sectionType |
    !sectionStartTime |
    !sectionEndTime |
    !sectionDay |
    !sectionCapacity |
    !sectionYear |
    !sectionSemester |
    !sectionLocation |
    !sectionDescription
  ) {
    throwErrorWithStatus(400, "Missing parameters");
  }

  sectionName = verify.isAlphaString(sectionName, "sectionName");
  sectionType = verify.sectionType(sectionType);
  sectionStartTime = verify.time(sectionStartTime, "sectionStartTime");
  sectionEndTime = verify.time(sectionEndTime, "sectionEndTime");
  sectionDay = verify.day(sectionDay, "sectionDay");
  sectionCapacity = verify.numberInteger(sectionCapacity, "sectionCapacity");
  sectionYear = verify.year(sectionYear);
  sectionSemester = verify.semester(sectionSemester, "sectionSemester");
  sectionLocation = verify.string(sectionLocation, "sectionLocation");
  sectionDescription = verify.string(sectionDescription, "sectionDescription");

  return {
    sectionName,
    sectionType,
    sectionStartTime,
    sectionEndTime,
    sectionDay,
    sectionCapacity,
    sectionYear,
    sectionSemester,
    sectionLocation,
    sectionDescription,
  };
};

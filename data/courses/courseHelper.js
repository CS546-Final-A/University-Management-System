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

import verify, {
  throwErrorWithStatus,
  santizeInputs,
} from "../../data_validation.js";

function parseDateString(dateString) {
  // Split the date string into year, month, and day

  if (dateString instanceof Date) {
    return dateString;
  }
  console.log(dateString);
  const parts = dateString.split("-");

  // Ensure that the date string has three parts
  if (parts.length === 3) {
    // Extract year, month, and day from the parts
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based
    const day = parseInt(parts[2], 10);

    // Check if the extracted values are valid
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      // Create a new Date object using the extracted values
      return new Date(year, month, day);
    }
  }

  // Return null if the date string is not in the expected format
  return throwErrorWithStatus(400, "Invalid date string");
}

export const validateAssignment = (
  userId,
  assignmentName,
  assignmentDescription,
  assignmentWeight,
  assignmentDueDate,
  assignmentSectionId,
  submissionLimit,
  assignmentMaxScore
) => {
  userId = verify.validateMongoId(userId);
  assignmentName = verify.string(assignmentName);
  assignmentDescription = verify.string(assignmentDescription);
  assignmentDueDate = new parseDateString(assignmentDueDate);

  if (!assignmentWeight) {
    throwErrorWithStatus(400, "Invalid assignment weight");
  }
  assignmentWeight = parseInt(assignmentWeight);

  assignmentSectionId = verify.validateMongoId(assignmentSectionId);

  if (assignmentWeight < 0 || assignmentWeight > 100) {
    throwErrorWithStatus(400, "Invalid assignment weight");
  }
  assignmentMaxScore = parseInt(assignmentMaxScore);
  if (
    !assignmentMaxScore ||
    typeof assignmentMaxScore !== "number" ||
    assignmentMaxScore < 0
  ) {
    throwErrorWithStatus(400, "Invalid assignment max score");
  }

  if (assignmentDueDate < Date.now()) {
    throwErrorWithStatus(400, "Invalid assignment due date");
  }
  submissionLimit = parseInt(submissionLimit);
  if (
    !submissionLimit ||
    typeof submissionLimit !== "number" ||
    submissionLimit < 0
  ) {
    throwErrorWithStatus(400, "Invalid submission limit");
  }

  return {
    userId,
    assignmentName,
    assignmentDescription,
    assignmentWeight,
    assignmentDueDate,
    assignmentSectionId,
    submissionLimit,
    assignmentMaxScore,
  };
};

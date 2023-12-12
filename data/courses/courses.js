import { departments, courses } from "../../config/mongoCollections.js";
import verify, {
  throwErrorWithStatus,
  throwerror,
} from "../../data_validation.js";
import { validateCourse, validateSection } from "./courseHelper.js";
import { ObjectId } from "mongodb";

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Departments
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const getAllDepartments = async () => {
  let departmentList = [];
  const departmentCollection = await departments();
  departmentList = await departmentCollection.find({}).toArray();
  return departmentList;
};

export const getDepartmentById = async (departmentId) => {
  verify.validateMongoId(departmentId, "departmentId");
  const departmentCollection = await departments();
  const department = await departmentCollection.findOne({
    _id: departmentId,
  });
  if (!department) {
    throwerror("Department does not exists");
  } else return department;
};

export const registerDepartment = async (departmentName) => {
  const newDepartment = verify.string(departmentName, "departmentName");

  const departmentCollection = await departments();
  const department = await departmentCollection.findOne({
    departmentName: departmentName,
  });
  if (department) {
    throwerror("Department already exists!");
  } else {
    const insertInfo = await departmentCollection.insertOne(newDepartment);
    const newId = insertInfo.insertedId.toString();
    return newId;
  }
};

export const updateDepartment = async (departmentId, departmentName) => {
  departmentId = verify.validateMongoId(departmentId, "departmentId");
  const departmentCollection = await departments();
  let department = await departmentCollection.findOne({
    _id: departmentId,
  });
  department.departmentName = departmentName;
  const updateInfo = await departmentCollection.updateOne(
    { _id: department._id },
    { $set: department },
    { returnDocument: "after" }
  );
  if (!updateInfo) throwerror("Department was not updated successfully!");

  return await getDepartmentById(departmentId);
};

export const deleteDepartment = async (departmentId) => {
  departmentId = verify.validateMongoId(departmentId, "departmentId");
  const departmentCollection = await departments();
  const deletionInfo = await departmentCollection.findOneAndDelete({
    _id: departmentId,
  });

  if (!deletionInfo) {
    throwerror("Department was not deleted successfully!");
  }
  return { departmentName: deletionInfo.departmentName, deleted: true };
};

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Courses
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const getAllCourses = async () => {
  let courseList = [];
  const courseCollection = await courses();
  courseList = await courseCollection
    .aggregate([
      {
        $lookup: {
          from: "users",
          localField: "sections.sectionInstructor",
          foreignField: "_id",
          as: "instructor",
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "courseDepartmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $project: {
          _id: 1,
          // Include all other fields from the "courses" collection
          courseName: 1,
          courseNumber: 1,
          courseDepartmentId: 1,
          courseCredits: 1,
          departmentName: "$department.departmentName",
          courseDescription: 1,
          // Include all fields from the "sections" collection
          instructors: "$instructor",
        },
      },
    ])
    .toArray();
  console.log(courseList);
  return courseList;
};

export const registerCourse = async (
  courseNumber,
  courseName,
  courseDepartmentId,
  courseCredits,
  courseDescription
) => {
  let newCourse = validateCourse(
    courseNumber,
    courseName,
    courseDepartmentId,
    courseCredits,
    courseDescription
  );

  const courseCollection = await courses();
  const departmentCollection = await departments();
  const existingCourse = await courseCollection.findOne({
    courseNumber: courseNumber,
    courseName: courseName,
  });
  if (existingCourse) {
    throwErrorWithStatus(400, "Course already exists");
  }
  const department = await departmentCollection.findOne({
    _id: newCourse.courseDepartmentId,
  });
  if (!department) {
    throwErrorWithStatus(400, "Department not found");
  }
  const insertInfo = await courseCollection.insertOne(newCourse);
  return insertInfo;
};
export const getCourseById = async (courseId) => {
  courseId = verify.validateMongoId(courseId, "courseId");
  const courseCollection = await courses();
  const existingCourse = await courseCollection.findOne({
    _id: courseId,
  });

  if (!existingCourse) {
    throwErrorWithStatus(400, `Course with ${courseId} not found`);
  }
  return existingCourse;
};

export const getCoursesByIds = async (courseIds) => {
  courseIds.forEach((courseId) => {
    courseId = verify.validateMongoId(courseId, "courseId");
  });

  const coursesCollection = await courses();
  const objectIds = courseIds.map((courseId) => new ObjectId(courseId));

  const coursesList = await coursesCollection
    .find({
      _id: { $in: objectIds },
    })
    .toArray();

  if (!coursesList || coursesList.length === 0) {
    throwErrorWithStatus(400, "No courses found with the provided courseIds");
  }

  return coursesList;
};

export const updateCourse = async (
  courseId,
  courseNumber,
  courseName,
  courseDepartmentId,
  courseCredits,
  courseDescription
) => {
  courseId = verify.validateMongoId(courseId, "courseId");
  let existingCourse = validateCourse(
    courseNumber,
    courseName,
    courseDepartmentId,
    courseCredits,
    courseDescription
  );
  const courseCollection = await courses();
  const updateInfo = await courseCollection.updateOne(
    { _id: courseId },
    {
      $set: existingCourse,
    },
    { returnDocument: "after" }
  );

  if (!updateInfo) {
    throwErrorWithStatus(400, `Course was not updated successfully!`);
  }
  return updateInfo;
};
export const deleteCourse = async (courseId) => {
  courseId = verify.validateMongoId(courseId, "courseId");
  const courseCollection = await courses();
  const deleteInfo = await courseCollection.findOneAndDelete({
    _id: courseId,
  });
  if (!deleteInfo) {
    throwErrorWithStatus(400, `Course was not deleted successfully!`);
  }
  return deleteInfo;
};

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Sections
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const getSectionsByCourseId = async (courseId) => {
  courseId = verify.validateMongoId(courseId, "courseId");
  const courseCollection = await courses();
  const sections = await courseCollection.findOne(
    { _id: courseId },
    { sections: 1 }
  );
  if (!sections) {
    throwErrorWithStatus(400, `Course was not found`);
  }
  return sections;
};

export const getSectionById = async (sectionId) => {
  sectionId = verify.validateMongoId(sectionId, "sectionId");
  const courseCollection = await courses();
  const course = await courseCollection.findOne({
    "sections.sectionId": sectionId,
  });
  if (!course) {
    throwErrorWithStatus(400, `Section was not found!`);
  }
  const section = course.sections.find(
    (section) => section.sectionId.toString() === sectionId.toString()
  );
  return section;
};

export const registerSection = async (
  courseId,
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
  courseId = verify.validateMongoId(courseId, "courseId");

  let newSection = validateSection(
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
  );

  const courseCollection = await courses();
  newSection.sectionId = new ObjectId();
  const updateInfo = await courseCollection.update(
    { _id: courseId },
    { $push: { sections: newSection } }
  );
  if (!updateInfo) {
    throwErrorWithStatus(
      400,
      `Section was not added to the course successfully!`
    );
  }
  return updateInfo;
};

export const updateSection = async (
  sectionId,
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
  sectionId = verify.validateMongoId(sectionId, "sectionId");
  let updatedSection = validateSection(
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
  );
  const courseCollection = await courses();

  const course = await courseCollection.findOne({
    "sections.sectionId": sectionId,
  });

  if (!course) {
    throwErrorWithStatus(400, `Section was not found!`);
  }

  updatedSection.sectionId = sectionId;
  const updateInfo = await courseCollection.updateOne(
    { "sections.sectionId": sectionId },
    {
      $set: {
        "sections.$": updatedSection,
      },
    },
    { returnDocument: "after" }
  );
  if (!updateInfo) {
    throwErrorWithStatus(
      400,
      `Section was not added to the course successfully!`
    );
  }
  return updateInfo;
};

export const deletesection = async (sectionId) => {
  sectionId = verify.validateMongoId(sectionId, "sectionId");

  const courseCollection = await courses();
  const section = await courseCollection.findOne({
    "sections.sectionId": sectionId,
  });

  if (!section) {
    throwErrorWithStatus(400, `Section was not found!`);
  }
  const deletionInfo = db.courseCollection.updateOne(
    { "sections.sectionId": sectionId },
    { $pull: { sections: { sectionId: sectionId } } }
  );

  if (!deletionInfo) {
    throwerror("Section was not deleted successfully!");
  }
};


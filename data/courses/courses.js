import { departments, courses } from "../../config/mongoCollections.js";
import verify, {
  throwErrorWithStatus,
  throwerror,
} from "../../data_validation.js";
import { validateCourse } from "./courseHelper.js";
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
          from: "sections",
          localField: "_id",
          foreignField: "courseId",
          as: "sections",
        },
      },
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
          sectionId: "$sections._id",
          sectionType: "$sections.sectionType",
          sectionNumber: "$sections.sectionName",
          sectionCapacity: "$sections.sectionCapacity",
          sectionDay: "$sections.sectionDay",
          sectionType: "$sections.sectionType",
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

export const getSectionByCourseId = async (courseId) => {};

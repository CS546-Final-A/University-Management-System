import { departments, courses, users } from "../../config/mongoCollections.js";
import verify, {
  throwErrorWithStatus,
  throwerror,
} from "../../data_validation.js";
import { validateCourse, validateSection } from "./courseHelper.js";
import { ObjectId } from "mongodb";

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Instructors
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const getAllInstructors = async () => {
  let instructorList = [];
  const userCollection = await users();
  instructorList = await userCollection.find({ type: "Professor" }).toArray();
  return instructorList;
};

export const getUniqueInstructorNamesandId = async () => {
  const userCollection = await users();
  const instructors = await userCollection
    .aggregate([
      { $match: { type: "Professor" } },
      {
        $group: {
          _id: { firstname: "$firstname", lastname: "$lastname" },
          id: { $first: "$_id" },
        },
      },
      {
        $project: {
          name: { $concat: ["$_id.firstname", " ", "$_id.lastname"] },
          id: 1,
        },
      },
    ])
    .toArray();
  return instructors;
};
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Departments
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const getAllDepartments = async () => {
  let departmentList = [];
  const departmentCollection = await departments();
  departmentList = await departmentCollection.find({}).toArray();
  return departmentList;
};

export const getUniqueDepartmentNamesandId = async () => {
  const departmentCollection = await departments();
  const departmentList = await departmentCollection.distinct("departmentName");
  const uniqueDepartmentNames = [];

  for (const name of departmentList) {
    const department = await departmentCollection.findOne({
      departmentName: name,
    });
    uniqueDepartmentNames.push({
      name,
      id: department._id.toString(),
    });
  }

  return uniqueDepartmentNames;
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

export const getAllCourses = async (
  year,
  semester,
  searchTerm,
  departmentFilter,
  instructorFilter,
  meetingDaysFilter,
  deliveryModeFilter
) => {
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
        $match: {
          sections: {
            $elemMatch: {
              sectionYear: year,
              sectionSemester: semester,
            },
          },
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
          sections: {
            $filter: {
              input: "$sections",
              as: "section",
              cond: {
                $and: [
                  { $eq: ["$$section.sectionYear", year] },
                  { $eq: ["$$section.sectionSemester", semester] },
                ],
              },
            },
          },
          departmentName: "$department.departmentName",
          courseDescription: 1,
          // Include all fields from the "sections" collection
          instructors: "$instructor",
        },
      },
    ])
    .toArray();
  // console.log(courseList);

  for (let course in courseList) {
    courseList[course]["_id"] = courseList[course]["_id"].toString();
  }

  if (searchTerm) {
    console.log(searchTerm);
    courseList = courseList.filter((course) => {
      let x = course.courseNumber + " - " + course.courseName.toLowerCase();
      console.log(x);
      return x.includes(searchTerm.toLowerCase());
    });
  }

  if (departmentFilter) {
    courseList = courseList.filter((course) => {
      console.log(course.courseDepartmentId);
      let x = course.courseDepartmentId.toString();
      return x.includes(departmentFilter.toLowerCase());
    });
  }

  if (instructorFilter) {
    courseList = courseList.filter((course) => {
      for (let section of course.sections) {
        let x = section.sectionInstructor.toString();
        return x.includes(instructorFilter);
      }
    });
  }

  if (meetingDaysFilter) {
    courseList = courseList.filter((course) => {
      for (let section of course.sections) {
        let x = section.sectionDay.toString();
        return x.includes(meetingDaysFilter);
      }
    });
  }

  if (deliveryModeFilter) {
    courseList = courseList.filter((course) => {
      for (let section of course.sections) {
        let x = section.sectionType.toString();
        return x.includes(deliveryModeFilter);
      }
    });
  }

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
  sectionInstructor,
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
    sectionInstructor,
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

export const getUniqueSectionYearandSemester = async () => {
  const courseCollection = await courses();
  const courseList = await courseCollection
    .find({
      $and: [
        { "sections.sectionYear": { $exists: true } },
        { "sections.sectionSemester": { $exists: true } },
      ],
    })
    .project({
      sections: { sectionYear: 1, sectionSemester: 1 },
    })
    .toArray();

  const uniqueYear = new Set([]);
  const uniqueSemester = new Set([]);

  for (const sections of courseList) {
    for (const section of sections.sections) {
      // console.log(section);
      uniqueYear.add(section.sectionYear);
      uniqueSemester.add(section.sectionSemester);
    }
  }

  return [uniqueYear, uniqueSemester];
};

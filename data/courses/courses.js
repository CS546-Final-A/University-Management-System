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

export const getInstructorById = async (instructorId) => {
  instructorId = verify.validateMongoId(instructorId, "instructorId");
  const userCollection = await users();
  const instructor = await userCollection.findOne({
    _id: instructorId,
    type: "Professor",
  });
  if (!instructor) {
    throwerror("Instructor does not exists");
  } else return instructor;
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
  departmentName = verify.string(departmentName, "departmentName");

  const departmentCollection = await departments();
  const department = await departmentCollection.findOne({
    departmentName: departmentName,
  });
  if (department) {
    throwerror("Department already exists!");
  } else {
    const newDepartment = {
      departmentName: departmentName,
    };
    const insertInfo = await departmentCollection.insertOne(newDepartment);
    return insertInfo;
  }
};

export const updateDepartment = async (departmentId, departmentName) => {
  departmentId = verify.validateMongoId(departmentId, "departmentId");
  const departmentCollection = await departments();
  let department = await departmentCollection.findOne({
    _id: departmentId,
  });
  if (!department) {
    throw { status: 404, message: "Department not found" };
  }
  department.departmentName = departmentName;
  const updateInfo = await departmentCollection.updateOne(
    { _id: department._id },
    { $set: department },
    { returnDocument: "after" }
  );
  if (!updateInfo) throwerror("Department was not updated successfully!");

  return updateInfo;
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
          courseSemester: semester,
          courseYear: year,
        },
      },
      {
        $project: {
          _id: 1,
          courseName: 1,
          courseNumber: 1,
          courseDepartmentId: 1,
          courseCredits: 1,
          courseSemester: 1,
          courseYear: 1,
          sections: 1,
          departmentName: "$department.departmentName",
          courseDescription: 1,
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
  courseDescription,
  courseSemester,
  courseYear
) => {
  let newCourse = validateCourse(
    courseNumber,
    courseName,
    courseDepartmentId,
    courseCredits,
    courseDescription,
    courseSemester,
    courseYear
  );

  const courseCollection = await courses();
  const departmentCollection = await departments();
  const existingCourse = await courseCollection.findOne({
    courseNumber: courseNumber,
    courseName: courseName,
    courseSemester: courseSemester,
    courseYear: courseYear,
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
  newCourse.sections = [];
  newCourse.courseLearning = {
    headings: [],
    files: [],
  }
  const insertInfo = await courseCollection.insertOne(newCourse);
  return insertInfo;
};
export const getCourseById = async (courseId) => {
  courseId = verify.validateMongoId(courseId, "courseId");
  const courseCollection = await courses();
  const existingCourse = await courseCollection
    .aggregate([
      { $match: { _id: courseId } },
      {
        $lookup: {
          from: "departments",
          localField: "courseDepartmentId",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: "$department",
      },

      {
        $project: {
          courseNumber: 1,
          courseName: 1,
          courseCredits: 1,
          courseDescription: 1,
          courseYear: 1,
          courseSemester: 1,
          sections: 1,
          courseLearning: 1,
          courseYear: 1,
          courseSemester: 1,

          courseDepartmentId: {
            _id: "$department._id",
            name: "$department.departmentName",
          },
        },
      },
    ])
    .toArray();
  try {
    for (let sectionIndex in existingCourse[0].sections) {
      let instructorId =
        existingCourse[0].sections[sectionIndex].sectionInstructor;
      let instructor = await getInstructorById(instructorId.toString());
      let sectionInstructor = {
        _id: instructor._id,
        name: instructor.firstname + " " + instructor.lastname,
      };
      existingCourse[0].sections[sectionIndex].sectionInstructor =
        sectionInstructor;
    }
  } catch (e) {
    if (!existingCourse.length) {
      throwErrorWithStatus(404, `Course with ${courseId} not found`);
    }
    throw "Internal Server Error";
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
  delete existingCourse?.courseSemester;
  delete existingCourse?.courseYear;
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
  sectionId = verify.validateMongoId(sectionId.toString(), "sectionId");
  const courseCollection = await courses();
  const course = await courseCollection.findOne({
    "sections.sectionId": sectionId,
  });
  if (!course) {
    throwErrorWithStatus(404, `Section was not found!`);
  }
  const section = course.sections.find(
    (section) => section.sectionId.toString() === sectionId.toString()
  );

  if (section) {
    section.courseId = course._id.toString();
    section.courseName = course.courseName;
    section.courseNumber = course.courseNumber;
  }

  return section;
};

export const getSectionsByIds = async (sectionIds) => {
  const validatedSectionIds = sectionIds.map((sectionId) =>
    verify.validateMongoId(sectionId, "sectionId")
  );

  const courseCollection = await courses();
  const coursesWithSections = await courseCollection
    .find({
      "sections.sectionId": { $in: validatedSectionIds },
    })
    .toArray();

  const sections = [];

  coursesWithSections.forEach((course) => {
    const matchingSections = course.sections
      .filter((section) => sectionIds.includes(section.sectionId.toString()))
      .map((section) => ({
        ...section,
        courseId: course._id.toString(),
        courseName: course.courseName,
        courseNumber: course.courseNumber,
      }));

    sections.push(...matchingSections);
  });

  return sections;
};

export const getStudentsInSection = async (sectionId) => {
  sectionId = verify.validateMongoId(sectionId, "sectionId");
  const courseCollection = await courses();
  const course = await courseCollection.findOne({
    "sections.sectionId": sectionId,
  });
  if (!course) {
    throwErrorWithStatus(404, `Section was not found!`);
  }
  const section = course.sections.find(
    (section) => section.sectionId.toString() === sectionId.toString()
  );

  const userIds = section.students;
  const userCollection = await users();
  const userList = await userCollection
    .find({ _id: { $in: userIds } })
    .toArray();

  const mappedStudents = section.students.map((student) => {
    const user = userList.find(
      (user) => user._id.toString() === student.toString()
    );
    return {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      studentId: student,
    };
  });

  return mappedStudents;
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
    sectionLocation,
    sectionDescription
  );

  const courseCollection = await courses();
  const userCollection = await users();
  const existingSection = await courseCollection.findOne({
    _id: courseId,
    "sections.sectionName": newSection.sectionName,
  });

  if (existingSection)
    throwErrorWithStatus(400, "Section with the same name already exists");

  newSection.sectionId = new ObjectId();
  newSection.students = [];


  const userupdate = await userCollection.updateOne(
    {
      _id: newSection.sectionInstructor,
    },
    { $push: { registeredCourses: newSection.sectionId.toString() } }
  );

  const updateInfo = await courseCollection.updateOne(
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
  sectionInstructor,
  sectionType,
  sectionStartTime,
  sectionEndTime,
  sectionDay,
  sectionCapacity,
  sectionLocation,
  sectionDescription
) => {
  sectionId = verify.validateMongoId(sectionId, "sectionId");
  let updatedSection = validateSection(
    sectionName,
    sectionInstructor,
    sectionType,
    sectionStartTime,
    sectionEndTime,
    sectionDay,
    sectionCapacity,
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

  const section = course.sections.find(
    (section) => section.sectionId.toString() === sectionId.toString()
  );

  let removeSection, addSection;
  if (section.sectionInstructor.toString() !== sectionInstructor) {
    const userCollection = await users();
    removeSection = await userCollection.updateOne(
      { _id: section.sectionInstructor },
      { $pull: { registeredCourses: sectionId.toString() } }
    );
    addSection = await userCollection.updateOne(
      { _id: updatedSection.sectionInstructor },
      { $push: { registeredCourses: sectionId.toString() } }
    );
  }

  updatedSection.sectionId = sectionId;
  const updateInfo = await courseCollection.updateOne(
    { "sections.sectionId": sectionId },
    {
      $set: {
        "sections.$.sectionName": updatedSection.sectionName,
        "sections.$.sectionInstructor": updatedSection.sectionInstructor,
        "sections.$.sectionType": updatedSection.sectionType,
        "sections.$.sectionStartTime": updatedSection.sectionStartTime,
        "sections.$.sectionEndTime": updatedSection.sectionEndTime,
        "sections.$.sectionDay": updatedSection.sectionDay,
        "sections.$.sectionCapacity": updatedSection.sectionCapacity,
        "sections.$.sectionLocation": updatedSection.sectionLocation,
        "sections.$.sectionDescription": updatedSection.sectionDescription,
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

export const deleteSection = async (sectionId) => {
  sectionId = verify.validateMongoId(sectionId, "sectionId");

  const courseCollection = await courses();
  const course = await courseCollection.findOne({
    "sections.sectionId": sectionId,
  });

  if (!course) {
    throwErrorWithStatus(400, `Section was not found!`);
  }
  const deletionInfo = await courseCollection.updateOne(
    { "sections.sectionId": sectionId },
    { $pull: { sections: { sectionId: sectionId } } }
  );

  if (!deletionInfo) {
    throwerror("Section was not deleted successfully!");
  }
  deletionInfo.courseId = course._id;
  return deletionInfo;
};

export const enrollSection = async (sectionId, userId) => {
  sectionId = verify.validateMongoId(sectionId, "sectionId");
  userId = verify.validateMongoId(userId, "userId");

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

  // Capacity Check
  if (section?.students?.length >= section.sectionCapacity) {
    throwErrorWithStatus(400, `Section is at maximum capacity. Cannot enroll.`);
  }
  // Enrollment Check
  if (section.students.includes(userId)) {
    throwErrorWithStatus(400, `User is already enrolled in this section.`);
  }
  const userCollection = await users();
  const user = await userCollection.findOne({
    _id: userId,
    type: "Student",
  });
  if (!user) {
    throwErrorWithStatus(400, `User is not a student. Cannot enroll.`);
  }

  // Section Enrollment Check
  const enrolledInSection = course.sections.find((s) =>
    user.registeredCourses.includes(s.sectionId.toString())
  );

  if (enrolledInSection) {
    throwErrorWithStatus(
      400,
      `User is already enrolled in a section within this course. Cannot enroll.`
    );
  }

  // Time check
  const conflictingSections = await userCollection
    .find({
      _id: userId,
      registeredCourses: { $in: course.sections.map((s) => s.sectionId) },
    })
    .toArray();

  for (const enrolledSection of conflictingSections) {
    for (const enrolledSectionId of enrolledSection.registeredCourses) {
      const enrolledCourse = await courseCollection.findOne({
        "sections.sectionId": enrolledSectionId,
      });

      const enrolledSectionInCourse = enrolledCourse?.sections?.find(
        (s) => s.sectionId.toString() === enrolledSectionId.toString()
      );
      if (
        enrolledSectionInCourse &&
        enrolledSectionInCourse.sectionDay === section.sectionDay &&
        isTimeSlotOverlap(
          section.sectionStartTime,
          section.sectionEndTime,
          enrolledSectionInCourse.sectionStartTime,
          enrolledSectionInCourse.sectionEndTime
        )
      ) {
        throwErrorWithStatus(
          400,
          `User is already enrolled in a conflicting time slot. Cannot enroll.`
        );
      }
    }
  }

  section.students.push(userId);

  await userCollection.updateOne(
    { _id: userId },
    {
      $push: {
        registeredCourses: sectionId.toString(),
      },
    }
  );
  const updateResult = await courseCollection.updateOne(
    { "sections.sectionId": sectionId },
    {
      $set: {
        "sections.$": section,
      },
    }
  );

  if (updateResult.modifiedCount !== 1) {
    throwErrorWithStatus(400, `Failed to enroll user.`);
  }
};

export const discardSection = async (sectionId, userId) => {
  sectionId = verify.validateMongoId(sectionId, "sectionId");
  userId = verify.validateMongoId(userId, "userId");

  const courseCollection = await courses();
  const userCollection = await users();

  const course = await courseCollection.findOne({
    "sections.sectionId": sectionId,
  });

  if (!course) {
    throwErrorWithStatus(400, `Section was not found!`);
  }

  const section = course.sections.find(
    (section) => section.sectionId.toString() === sectionId.toString()
  );

  if (
    !section.students.some(
      (enrolledUserId) => enrolledUserId.toString() === userId.toString()
    )
  ) {
    throwErrorWithStatus(400, `User is not enrolled in this section.`);
  }

  await userCollection.updateOne(
    { _id: userId },
    {
      $pull: {
        registeredCourses: sectionId.toString(),
      },
    }
  );

  section.students = section.students.filter(
    (enrolledUserId) => enrolledUserId.toString() !== userId.toString()
  );

  const updateResult = await courseCollection.updateOne(
    { "sections.sectionId": sectionId },
    {
      $set: {
        "sections.$": section,
      },
    }
  );

  if (updateResult.modifiedCount !== 1) {
    throwErrorWithStatus(400, `Failed to discard user from the section.`);
  }
};

const isTimeSlotOverlap = (start1, end1, start2, end2) => {
  return !(end1 < start2 || start1 > end2);
};

export const getUniqueSectionYearandSemester = async () => {
  const courseCollection = await courses();
  const distinctYear = await courseCollection.distinct("courseYear");
  const distinctSemester = await courseCollection.distinct("courseSemester");
  return [distinctYear, distinctSemester];
};

export const checkStudentInSection = async (sectionId, studentId) => {
  sectionId = verify.validateMongoId(sectionId, "sectionId");
  studentId = verify.validateMongoId(studentId, "studentId");

  const courseCollection = await courses();
  const course = await courseCollection.findOne(
    {
      "sections.sectionId": sectionId,
    },
    {
      $match: {
        sections: { $elemMatch: { sectionId: sectionId, students: studentId } },
      },
    },
    { $project: { sections: 1 } }
  );
  if (!course) {
    throwErrorWithStatus(400, `Section was not found!`);
  }

  return course;
};

export const checkEnrollment = async (sectionId, studentId) => {
  try {
    sectionId = verify.validateMongoId(sectionId.toString(), "sectionId");
    studentId = verify.validateMongoId(studentId, "studentId");

    const courseCollection = await courses();
    const enrollmentData = await courseCollection.findOne({
      "sections.sectionId": sectionId,
      "sections.students": studentId,
    });

    return !!enrollmentData;
  } catch (error) {
    return false;
  }
};

export const addHeading = async (courseId, heading) => {
  try {
    courseId = verify.validateMongoId(courseId.toString(), "courseId");
    const courseCollection = await courses();
    const result = await courseCollection.updateOne(
      { _id: courseId },
      { $push: { "courseLearning.headings": heading } }
    );

    if (result.modifiedCount === 1) {
      return { success: true, message: "Heading added successfully" };
    } else {
      return { success: false, message: "Failed to add heading" };
    }
  } catch (error) {
    console.error("Error adding heading:", error);
    return {
      success: false,
      message: "An error occurred while adding heading",
    };
  }
};

export const addFileDetails = async (heading, fileName, filePath, courseId) => {
  try {
    courseId = verify.validateMongoId(courseId.toString(), "courseId");
    const courseCollection = await courses();
    const fileId = new ObjectId();
    const result = await courseCollection.updateOne(
      { _id: new ObjectId(courseId) },
      {
        $push: {
          "courseLearning.files": {
            _id: fileId,
            heading: heading,
            fileName: fileName,
            filePath: filePath,
          },
        },
      }
    );

    if (result.modifiedCount === 1) {
      console.log("File details added successfully");
    } else {
      console.log("Failed to add file details");
    }
  } catch (error) {
    console.error("Error adding file details:", error);
  }
};

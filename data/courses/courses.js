import { departments } from "../../config/mongoCollections";
import verify, { throwerror } from "../../data_validation.js";

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Departments
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export const getAllDepartments = async () => {
  const departmentCollection = await departments();
  const departmentList = await departmentCollection.find({}).toArray();
  if (!departmentList) throwerror("Departments not found");
  return departmentList;
};

export const getDepartmentById = async (departmentId) => {
  verify.dbid(departmentId);
  const departmentCollection = await departments();
  const department = await departmentCollection.findOne({
    _id: new ObjectId(departmentId),
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
  verify.dbid(departmentId);
  const departmentCollection = await departments();
  let department = await departmentCollection.findOne({
    _id: new ObjectId(departmentId),
  });
  department.departmentName = departmentName;
  const updateInfo = await departmentCollection.updateOne(
    { _id: new ObjectId(department._id) },
    { $set: department },
    { returnDocument: "after" }
  );
  if (!updateInfo) throwerror("Department was not updated successfully!");

  return await getDepartmentById(departmentId);
};

export const deleteDepartment = async (departmentId) => {
  verify.dbid(departmentId);
  const departmentCollection = await departments();
  const deletionInfo = await departmentCollection.findOneAndDelete({
    _id: new ObjectId(departmentId),
  });

  if (!deletionInfo) {
    throwerror("Department was not deleted successfully!");
  }
  return { departmentName: deletionInfo.departmentName, deleted: true };
};

export const registerCourse = async (
  courseName,
  courseDepartment,
  courseCredits,
  courseDescription
) => {};

import { ObjectId } from "mongodb";
import { sections } from "../../config/mongoCollections.js";

const getSectionById = async (sectionId) => {

  if (
    !sectionId ||
    typeof sectionId !== "string" ||
    sectionId.trim() === "" ||
    !ObjectId.isValid(sectionId)
  ) {
    throw new Error("ID provided must be valid.");
  }
  const sectionsCollection = await sections();
  const section = await sectionsCollection.findOne({
    _id: new ObjectId(sectionId),
  });
  if (!section) {
    throw new Error("No section with that ID.");
  }
  section._id = section._id.toString();
  return section;



};

const getSectionsByIds = async (sectionIds) => {
  // Validate each sectionId in the array
  sectionIds.forEach((sectionId) => {
    if (
      !sectionId ||
      typeof sectionId !== "string" ||
      sectionId.trim() === "" ||
      !ObjectId.isValid(sectionId)
    ) {
      throw new Error("All IDs provided must be valid.");
    }
  });

  const sectionsCollection = await sections();
  const objectIds = sectionIds.map((sectionId) => new ObjectId(sectionId));

  const allSections = await sectionsCollection
    .find({
      _id: { $in: objectIds },
    })
    .toArray();

  if (!allSections || allSections.length === 0) {
    throw new Error("No sections found with the provided sectionIds.");
  }

  // Convert _id to string for each section
  allSections.forEach((section) => {
    section._id = section._id.toString();
  });

  return allSections;
};

export { getSectionById, getSectionsByIds };

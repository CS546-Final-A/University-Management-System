import { courses } from "../../config/mongoCollections.js";
import { ObjectId } from "mongodb";
/////////
// function not working properly. gotta lokk into it
/////////
export async function addModuleToSection(
  sectionId,
  moduleName,
  moduleDescription,
  moduleDate
) {
  try {
    const coursesCollection = await courses();
    const newModuleId = new ObjectId();

    const newModule = {
      moduleId: newModuleId,
      moduleName,
      moduleDescription,
      moduleDate,
    };

    const result = await coursesCollection.updateOne(
      { "sections.sectionId": new ObjectId(sectionId) },
      {
        $push: {
          "sections.$.sectionModules": newModule,
        },
      }
    );

    if (result.modifiedCount === 1) {
      console.log(`Module added to section ${sectionId} successfully.`);
      return newModuleId;
    } else {
      console.log(`Failed to add module to section ${sectionId}.`);
      return null;
    }
  } catch (error) {
    console.error("Error adding module to section:", error);
    throw new Error("Failed to add module to section");
  }
}

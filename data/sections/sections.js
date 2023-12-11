import { sections } from "../../config/mongoCollections.js";
import { ObjectId } from 'mongodb';

export default async function getSectionById(sectionId) {

    if (!sectionId|| typeof sectionId!== 'string' || sectionId.trim() === '' || !ObjectId.isValid(sectionId)) {
      throw new Error('ID provided must be valid.');
    }
      const sectionsCollection = await sections();
      const section = await sectionsCollection.findOne({ _id: new ObjectId(sectionId) });
      if (!section) {
        throw new Error('No section with that ID.');
      }
    section._id=section._id.toString();
      return section;
  
  }
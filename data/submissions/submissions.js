import { departments, courses, users } from "../../config/mongoCollections.js";
import verify, {
  throwErrorWithStatus,
  throwerror,
} from "../../data_validation.js";
import { validateCourse, validateSection } from "./courseHelper.js";
import { ObjectId } from "mongodb";

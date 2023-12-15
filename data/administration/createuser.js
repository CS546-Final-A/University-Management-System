import { randomUUID } from "crypto";

import { users } from "../../config/mongoCollections.js";

import verify from "../../data_validation.js";
import sendRegistrationEmail from "../emails/sendRegistrationEmail.js";

async function createUser(firstname, lastname, email, identification, type) {
  firstname = verify.name(firstname);
  lastname = verify.name(lastname);
  email = verify.email(email);
  identification = verify.governmentID(identification);
  const publicID = { type: identification.type };
  if (publicID.type === "ssn") {
    publicID.number = identification.number.split("-")[2];
  }
  type = verify.accountype(type);
  const usercol = await users();

  // Disallows multiple users with one email or identification number.
  // Allows users with same identification number, but different account type as long as a different email is used.
  const existinguser = await usercol.findOne(
    {
      $or: [
        { email: email },
        {
          "identification.type": identification.type,
          "identification.number": identification.number,
          type: type,
        },
      ],
    },
    {
      projection: {
        _id: 0,
        email: 1,
      },
    }
  );
  if (existinguser) {
    const error = { status: 400 };
    if (existinguser.email === email) {
      error.message = "A user with this email address already exists";
    } else {
      error.message = "A user with this id number already exists";
    }
    throw error;
  }

  let secret = randomUUID();

  let duplicatesecret = await usercol.findOne({ registrationcode: secret });

  while (duplicatesecret) {
    secret = randomUUID();

    duplicatesecret = await usercol.findOne({ registrationcode: secret });
  }

  const userdata = {
    firstname: firstname,
    lastname: lastname,
    email: email,
    identification: publicID,
    type: type,
    status: "Initalized",
    registrationcode: secret,
    registeredCourses: [],
  };

  const insertion = await usercol.insertOne(userdata);
  if (!insertion.acknowledged || !insertion.insertedId) {
    // Move to catch
    const error = { status: 500, message: "Database insertion error" };
    throw error;
  }

  try {
    await sendRegistrationEmail(email, secret);
    return { successful: true };
  } catch (e) {
    // cleanup on failed email and rethrow the error
    await usercol.deleteOne({ _id: insertion.insertedId });
    throw e;
  }
}

export default createUser;

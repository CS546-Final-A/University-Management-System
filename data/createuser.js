import { users } from "../config/mongoCollections.js";
import verify from "../data_validation.js";

/*async function createUser(type, email, password) {
  // Quick mockup function for testing user login procedure. Incomplete and insecure. Do not use in current state
  email = verify.email(email);
  password = verify.password(password);

  let passwordhash;

  try {
    passwordhash = await hash(password);
  } catch (e) {
    console.log(e);
    throw "Hashing error";
  }

  const usercol = await users();
  const results = await usercol.insertOne({
    email: email,
    password: passwordhash,
    type: type,
  });
  return results;
}*/

async function createUser(firstname, lastname, email, identification, type) {
  firstname = verify.name(firstname);
  lastname = verify.name(lastname);
  email = verify.email(email);
  if (identification.type === "ssn") {
    identification.number = verify.ssn(identification.number);
  } else {
    throw "Invalid identification type";
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
    if (existinguser.email === email) {
      throw "A user with this email address already exists";
    } else {
      throw "A user with this id number already exists";
    }
  }

  const userdata = {
    firstname: firstname,
    lastname: lastname,
    email: email,
    identification: identification,
    type: type,
    staus: "Initalized",
  };

  const insertion = await usercol.insertOne({ userdata });
  if (!insertion.acknowledged || !insertion.insertedId) {
    // Move to catch
    throw "Insertion error";
  }

  const userid = insertion.insertedId;
}

export default createUser;

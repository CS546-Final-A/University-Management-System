import { hash } from "argon2";
import { users } from "../config/mongoCollections.js";
import verify from "../data_validation.js";

async function createUser(type, email, password) {
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
}

export default createUser;

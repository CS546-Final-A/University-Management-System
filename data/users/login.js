import { verify as checkhash } from "argon2";

import { users } from "../../config/mongoCollections.js";
import verify from "../../data_validation.js";

async function login(email, password) {
  email = verify.email(email);
  password = verify.password(password);
  const usercol = await users();

  const user = await usercol.findOne(
    { email: email, status: "Active" },
    {
      projection: { password: 1, type: 1, firstname: 1, lastname: 1, email: 1 },
    }
  );

  if (!user) {
    return { successful: false };
  }
  if (await checkhash(user.password, password)) {
    const accountdetails = {
      successful: true,
      id: user._id,
      type: user.type,
      email: user.email,
      name: user.firstname + " " + user.lastname,
    };
    return accountdetails;
  } else {
    return { successful: false };
  }
}

export default login;

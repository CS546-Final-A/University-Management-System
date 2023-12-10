import argon2 from "argon2";
import verify from "../data_validation.js";

async function hashPassword(password) {
  password = verify.password(password);

  // OWASP reccomends using only one degree of parallelism.
  // The other recommendations are at a higher standard than recommended by default.
  password = await argon2.hash(password, {
    type: argon2.argon2id,
    parallelism: 1,
  });

  return password;
}

export default hashPassword;

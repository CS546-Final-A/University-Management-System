import { verify as checkhash } from "argon2";

import { users } from "../config/mongoCollections.js";
import verify from "../data_validation.js";

async function login(email, password) {
	email = verify.email(email);
	password = verify.password(password);
	const usercol = await users();

	try {
		const user = await usercol.findOne({ email: email }, { projection: { password: 1, type: 1 } });

		if (!user) {
			throw "No registered account with this email address";
		}
		if (await checkhash(user.password, password)) {
			const accountdetails = { successful: true, id: user._id, type: user.type };
			return accountdetails;
		} else {
			throw "Invalid password";
		}
	} catch (e) {
		if (e === "Invalid password" || e === "No registered account with this email address") {
			return { successful: false };
		} else {
			throw e;
		}
	}
}

export default login;

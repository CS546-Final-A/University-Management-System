import { ObjectId } from "mongodb";
import xss from "xss";

function throwerror(message) {
  const error = { status: 400, message: message };
  throw error;
}

export function santizeInputs(req) {
  // Sanitizes all inputs in a request object
  for (let key in req.body.data) {
    req.body.data[key] = xss(req.body.data[key]);
  }
  return req;
}

const verify = {
  email: (email) => {
    // Email checking function as I had it written for labs, can be made better
    function surroundingcheck(str, part) {
      str = str.split(part);
      for (let section of str) {
        if (section.length === 0) {
          throwerror("Invalid email");
        }
      }
    }
    if (typeof email != "string") {
      throwerror("Email is not a string");
    }
    email = email.trim().toLowerCase();

    if (!/^([a-z]|\d|\.|\_|\-)+@([a-z]|\d|\-)+\.([a-z]|\d|\-)+$/.test(email)) {
      throwerror("Invalid email");
    }
    const left = email.split("@")[0];

    surroundingcheck(left, ".");
    surroundingcheck(left, "_");
    surroundingcheck(left, "-");

    return email;
  },
  password: (password) => {
    // Password rules will be discussed together and updated accordingly
    if (typeof password != "string") {
      throwerror("Password is not a string");
    }
    password = password.trim();
    if (password.length < 1) {
      throwerror("Password is empty");
    }
    if (password.length > 128) {
      throwerror("Password is too long");
    }
    return password;
  },
  name: (name) => {
    if (typeof name !== "string") {
      throwerror("Name is not a string");
    }
    name = name.trim().toLowerCase();
    if (name.length < 3 || name.length > 20) {
      throwerror("Name must be between 3 and 20 charachters long");
    }
    const namearr = name.split("");
    for (let char of namearr) {
      if (!/([a-z]|-|\ |\')/.test(char)) {
        throwerror("Invalid charachter in name");
      }
    }
    return name[0].toUpperCase() + name.slice(1);
  },
  ssn: (ssn) => {
    if (typeof ssn !== "string") {
      throwerror("Social Security Number is not a string");
    }
    ssn = ssn.trim();
    if (!/^\d{3}-\d{2}-\d{4}$/.test(ssn)) {
      throwerror("Invalid Social Security Number");
    }
    return ssn;
  },
  governmentID: (id) => {
    if (typeof id !== "object") {
      throwerror("ID is not an object");
    }
    if (typeof id.type !== "string") {
      throwerror("ID type is not a string");
    }
    if (typeof id.number !== "string") {
      throwerror("ID number is not a string");
    }
    if (Object.keys(id).length !== 2) {
      throwerror("ID includes extraneous fields");
    }
    id.type = id.type.trim();
    const types = ["ssn"];
    if (!types.includes(id.type)) {
      throwerror("Invalid ID type");
    } else {
      id.number = verify[id.type](id.number);
    }
    return id;
  },
  accountype: (type) => {
    if (typeof type !== "string") {
      throwerror("Invalid account type");
    }
    type = type.trim();

    const types = ["Admin", "Professor", "Student"];
    if (!types.includes(type)) {
      throwerror("Invalid account type");
    }
    return type;
  },
  dbid: (id) => {
    if (!(id instanceof ObjectId)) {
      throwerror("Not an ObjectId");
    }
    return id;
  },
};

export default verify;

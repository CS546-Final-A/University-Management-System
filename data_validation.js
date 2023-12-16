import { ObjectId } from "mongodb";
import moment from "moment";
import xss from "xss";

export function throwerror(message) {
  const error = { status: 400, message: message };
  throw error;
}
export function throwErrorWithStatus(status, message) {
  const error = { status: status, message: message };
  throw error;
}

export function santizeInputs(req) {
  // Sanitizes all inputs in a request object
  for (let key in req.body) {
    req.body[key] = xss(req.body[key]);
  }
  return req;
}

const verify = {
  email: (email) => {
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
    // Password rules favoring length over complexity based on NIST recommendations
    // As described by Auth0 below
    // https://auth0.com/blog/dont-pass-on-the-new-nist-password-guidelines/
    if (typeof password != "string") {
      throwerror("Password is not a string");
    }
    password = password.trim();
    if (password.length < 8) {
      throwerror("Password must be between 8 and 128 characters long");
    }
    if (password.length > 128) {
      throwerror("Password must be between 8 and 128 characters long");
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
  sectionType: (type) => {
    if (typeof type !== "string") {
      throwerror("Invalid section type");
    }
    type = type.trim();

    const types = ["In Person", "Online"];
    if (!types.includes(type)) {
      throwerror("Invalid section type");
    }
    return type;
  },
  time: (time, timeName) => {
    const timeSplit = time.split(":");

    if (timeSplit.length !== 2) {
      throwerror(`Invalid ${timeName}`);
    }

    const hr = timeSplit[0];
    const min = timeSplit[1];

    if (isNaN(parseInt(hr))) throwerror(`Invalid hour in ${timeName}`);

    if (
      (parseInt(hr) < 0 || parseInt(hr) > 23)
    )
      throwerror(`Invalid hour in ${timeName}`);

    if (isNaN(min) || min < 0 || min > 59)
      throwerror(`Invalid minutes in ${timeName}`);

    return time;
  },
  day: (day, dayName) => {
    day = verify.string(day, dayName);
    const weekHelper = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    if (!weekHelper.includes(day)) {
      throwerror("Invalid week value");
    }
    return day;
  },
  semester: (semester, semesterName) => {
    semester = verify.string(semester, semesterName);
    const semesterHelper = ["Fall", "Spring", "Summer", "Winter"];
    if (!semesterHelper.includes(semester)) {
      throwerror("Invalid semester value");
    }
    return semester;
  },
  year: (year) => {
    const checkYear = moment(year);
    if (!checkYear.isValid()) {
      throwerror(`Year is not valid`);
    }

    return year;
  },
  dbid: (id) => {
    if (!(id instanceof ObjectId)) {
      throwerror("Not an ObjectId");
    }
    return id;
  },
  validateMongoId: (id, stringName) => {
    if (!ObjectId.isValid(id)) {
      throwerror(`${stringName} is not an ObjectId`);
    }
    return new ObjectId(id);
  },
  UUID: (id) => {
    if (typeof id !== "string") {
      throwerror("Argument is not a string");
    }
    id = id.trim();
    if (!/^[\w\d]{8}-[\w\d]{4}-[\w\d]{4}-[\w\d]{4}-[\w\d]{12}$/.test(id)) {
      throwerror("Invalid UUID");
    }
    return id;
  },
  string: (string, stringName) => {
    if (typeof string !== "string") throwerror(`${stringName} is not a string`);
    if (!string.trim()) throwerror(`${stringName} is not a string`);
    return string.trim();
  },
  number: (number, numberName) => {
    if (typeof number !== "number" || isNaN(number) || number < 0)
      throwerror(`${numberName} is not a valid number`);
    return number;
  },
  numberInteger: (number, numberName) => {
    number = parseInt(number, 10);
    verify.number(number, numberName);
    if (!Number.isInteger(number))
      throwerror(`${numberName} is not a valid number`);
    return number;
  },
  isAlphaString: (string, stringName) => {
    string = verify.string(string, stringName);
    if (!/^[A-Za-z]+$/.test(string)) {
      throwerror(`${stringName} should only have alphabets`);
    }
    return string;
  },
};

export default verify;

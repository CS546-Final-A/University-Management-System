const verify = {
  email: (email) => {
    function surroundingcheck(str, part) {
      str = str.split(part);
      for (let section of str) {
        if (section.length === 0) {
          throw "Invalid email";
        }
      }
    }

    if (typeof email != "string") {
      throw "Email is not a string";
    }
    email = email.trim().toLowerCase();

    if (!/^([a-z]|\d|\.|\_|\-)+@([a-z]|\d|\-)+\.([a-z]|\d|\-)+$/.test(email)) {
      throw "Invalid email";
    }
    const left = email.split("@")[0];

    surroundingcheck(left, ".");
    surroundingcheck(left, "_");
    surroundingcheck(left, "-");

    return email;
  },
  password: (password) => {
    if (typeof password != "string") {
      throw "Password is not a string";
    }
    password = password.trim();
    if (password.length < 8) {
      throw "Password must be between 8 and 128 characters long";
    }
    if (password.length > 128) {
      throw "Password must be between 8 and 128 characters long";
    }
    return password;
  },
  name: (name) => {
    if (typeof name !== "string") {
      throw "Name is not a string";
    }
    name = name.trim().toLowerCase();
    if (name.length < 3 || name.length > 20) {
      throw "Name must be between 3 and 20 charachters long";
    }
    const namearr = name.split("");
    for (let char of namearr) {
      if (!/([a-z]|-|\ |\')/.test(char)) {
        throw "Invalid charachter in name";
      }
    }
    return name[0].toUpperCase() + name.slice(1);
  },
  ssn: (ssn) => {
    if (typeof ssn !== "string") {
      throw "Social Security Number is not a string";
    }
    ssn = ssn.trim();
    if (!/^\d{3}-\d{2}-\d{4}$/.test(ssn)) {
      throw "Invalid Social Security Number";
    }
    return ssn;
  },
  accountype: (type) => {
    if (typeof type !== "string") {
      throw "Invalid account type";
    }
    type = type.trim();

    const types = ["Admin", "Professor", "Student"];
    if (!types.includes(type)) {
      throw "Invalid account type";
    }
    return type;
  },
  string: (str) => {
    if (typeof str !== "string") {
      throw "Invalid string";
    }
    str = str.trim();
    if (!str.length) {
      throw "Empty string";
    }
    return str;
  },
};

const verify = {
  email: (email) => {
    // Email checking function as I had it written for labs, can be made better
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
    // Password rules will be discussed together and updated accordingly
    if (typeof password != "string") {
      throw "Password is not a string";
    }
    password = password.trim();
    if (password.length < 1) {
      throw "Password is empty";
    }
    if (password.length > 128) {
      throw "Password is too long";
    }
    return password;
  },
};

export default verify;
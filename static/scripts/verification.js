const verify = {
  username: (username) => {
    // Will change username to email later. Verification rules will be updated accordingly
    if (typeof username != "string") {
      throw "Username is not a string";
    }
    username = username.trim();
    if (username.length < 1) {
      throw "Username is empty";
    }
    return username.toLowerCase();
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

let sending = false;
async function login() {
  if (sending) {
    return;
  }
  sending = true;

  const csrf = document.getElementById("csrf").value;

  let email;
  let password;

  try {
    email = verify.email(document.getElementById("email").value);
    password = verify.password(document.getElementById("password").value);
  } catch (e) {
    alert(e);
    sending = false;
    return;
  }

  try {
    const result = await request("POST", "/login", csrf, {
      email: email,
      password: password,
    });
    console.log(result);
  } catch (e) {
    alert("Login error");
    console.log(e);
  } finally {
    sending = false;
  }
}

function enterLogin(event) {
  if (
    event.key === "Enter" &&
    document.getElementById("email").value.length > 0 &&
    document.getElementById("password").value.length > 0
  ) {
    login();
  }
}
document.getElementById("submit").addEventListener("click", login);
document.getElementById("email").addEventListener("keyup", enterLogin);
document.getElementById("password").addEventListener("keyup", enterLogin);

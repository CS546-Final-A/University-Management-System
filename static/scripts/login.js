let sending = false;
async function login() {
  if (sending) {
    return;
  }
  sending = true;

  const csrf = document.getElementById("csrf").value;

  try {
    const username = verify.username(document.getElementById("username").value);
    const password = verify.password(document.getElementById("password").value);
    const result = await request("POST", "/login", csrf, {
      username: username,
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
document.getElementById("submit").addEventListener("click", login);

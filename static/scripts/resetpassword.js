function sendform() {
  let sending = false;
  return async (event) => {
    event.preventDefault();
    if (sending) {
      return;
    }
    sending = true;

    const csrf = document.getElementById("_csrf").value;

    try {
      const password = verify.password(
        document.getElementById("password").value
      );
      const passwordconf = verify.password(
        document.getElementById("passwordconf").value
      );
      if (password !== passwordconf) {
        throw "Passwords do not match";
      }
      const result = await request("PATCH", window.location.pathname, csrf, {
        password: password,
        passwordconf: passwordconf,
      });

      if (result.successful) {
        alert("Your password has been set");
        window.location.pathname = "/login";
      } else {
        throw "Internal server error";
      }
    } catch (e) {
      const errdiv = document.getElementById("error");
      errdiv.innerText = e;
    } finally {
      sending = false;
    }
  };
}

$("#resetpassword").on("submit", sendform());

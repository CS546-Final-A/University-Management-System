function sendform() {
  let sending = false;
  return async (event) => {
    event.preventDefault();
    if (sending) {
      return;
    }
    sending = true;

    const csrf = $("#_csrf").val();

    try {
      const password = verify.password($("#password").val());
      const passwordconf = verify.password($("#passwordconf").val());
      if (password !== passwordconf) {
        throw "Passwords do not match";
      }
      const result = await request("PATCH", window.location.pathname, csrf, {
        password: password,
        passwordconf: passwordconf,
      });

      if (result.successful) {
        alert("Your password has been reset");
        window.location.pathname = "/login";
      } else {
        throw "Internal server error";
      }
    } catch (e) {
      $("#error").text(e);
    } finally {
      sending = false;
    }
  };
}

$("#resetpassword").on("submit", sendform());

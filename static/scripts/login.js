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
    setError(e);
    sending = false;
    return;
  }

  try {
    const result = await request("POST", "/login", csrf, {
      email: email,
      password: password,
    });
    if (result.loggedin) {
      window.location.pathname = "/dashboard";
    } else {
      throw "Incorrect email or password";
    }
  } catch (e) {
    setError(e);
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

function setError(error) {
  var toastRed1 = $("html").css("--toastRed1");
  var toastRed2 = $("html").css("--toastRed2");
  $(".toast-header").css("background-color", toastRed1);
  $(".toast-header").css("color", "#000000");
  $(".toast-header .me-auto").html("&nbsp;&nbsp;Login Failed");

  // $(".toast-body").css("background-color", toastRed2);
  $(".toast-body").css("color", "#000000");
  $(".toast-body").html(error);
  $("#liveToast").toast("show");
}

document.getElementById("submit").addEventListener("click", login);
document.getElementById("email").addEventListener("keyup", enterLogin);
document.getElementById("password").addEventListener("keyup", enterLogin);

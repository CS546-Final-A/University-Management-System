function sendForm() {
  let sending = false;
  return async (event) => {
    event.preventDefault();
    if (sending) {
      return;
    }
    sending = true;
    try {
      const csrf = $("#csrf").val();
      const data = { email: verify.email($("#email").val()) };

      const result = await request("PUT", "/resetpassword", csrf, data);

      if (result.successful) {
        $("#loginform").text(
          `An email has been sent to ${data.email} with instructions to reset your password.`
        );
      }
    } catch (e) {
      setError(e);
      sending = false;
    }
  };
}

function setError(error) {
  var toastRed1 = $("html").css("--toastRed1");
  var toastRed2 = $("html").css("--toastRed2");
  $(".toast-header").css("background-color", toastRed1);
  $(".toast-header").css("color", "#000000");
  $(".toast-header .me-auto").html("&nbsp;&nbsp;Login Failed");

  // $(".toast-body").css("background-color", toastRed2);
  $(".toast-body").css("color", "#000000");
  $(".toast-body").text(error);
  $("#liveToast").toast("show");
}

$("#loginform").on("submit", sendForm());

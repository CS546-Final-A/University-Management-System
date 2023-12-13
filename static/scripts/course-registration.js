const registerCourse = async () => {
  const courseNumber = document.getElementById("courseNumber").value;
  const courseName = document.getElementById("courseName").value;
  const courseDepartmentId =
    document.getElementById("courseDepartmentId").value;
  const courseCredits = document.getElementById("courseCredits").value;
  const courseDescription = document.getElementById("courseDescription").value;

  try {
    const csrf = document.getElementById("csrf").value;

    let requestData = validateCourse(courseNumber, courseName, courseDepartmentId, courseCredits, courseDescription)
    await request("POST", "/courses/registration", csrf, requestData);
  } catch (e) {
    document.getElementById("status").innerText = "";
      if (e.error) {
        setError(e.error);
      } else {
        setError(e.message);
      }
  }
};

const goBack = async () => {
  window.location.href = `/courses/`;
};

function setError(error) {
  // Reset the fadout animation and overwrite text
  const errdiv = document.getElementById("error");
  errdiv.innerText = error;
  errdiv.style.animationName = "";
  errdiv.offsetHeight;
  errdiv.style.animationName = "fadeout";
}

function setToast(message) {
  var toastRed1 = $("html").css("--greenAccent");
  // var toastRed2 = $("html").css("--toastRed2");
  $(".toast-header").css("background-color", toastRed1);
  $(".toast-header").css("color", "#000000");
  $(".toast-header .me-auto").html("&nbsp;&nbsp;Success");

  // $(".toast-body").css("background-color", toastRed2);
  $(".toast-body").css("color", "#000000");
  $(".toast-body").html(message);
  $("#liveToast").toast("show");
}
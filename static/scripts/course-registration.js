const courseSubmit = async () => {
  const courseNumber = document.getElementById("courseNumber").value;
  const courseName = document.getElementById("courseName").value;
  const courseDepartmentId =
    document.getElementById("courseDepartmentId").value;
  const courseCredits = document.getElementById("courseCredits").value;
  const courseDescription = document.getElementById("courseDescription").value;
  const courseSemester = document.getElementById("courseSemester").value;
  const courseYear = document.getElementById("courseYear").value;

  try {
    const csrf = document.getElementById("csrf").value;

    let requestData = {
      courseNumber,
      courseName,
      courseDepartmentId,
      courseCredits,
      courseDescription,
      courseSemester,
      courseYear,
    };

    const result = await request(
      "POST",
      "/courses/registration",
      csrf,
      requestData
    );
    if (result?.error) {
      document.getElementById("error").innerText = result.error;
    } else if (result?.acknowledged) {
      window.location.href =
        "/courses/" + encodeURIComponent(result.insertedId);
    }
  } catch (e) {
    document.getElementById("error").innerText = "";
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

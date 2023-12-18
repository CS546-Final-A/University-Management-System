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
    verify.string(requestData.courseName);
    verify.string(requestData.courseDescription);
    if (
      isNaN(requestData.courseCredits) ||
      requestData.courseCredits < 0 ||
      requestData.courseCredits > 30
    ) {
      throw "Invalid amount of credits";
    }

    const result = await request(
      "POST",
      "/courses/registration",
      csrf,
      requestData
    );
    if (result?.error) {
      setError(result);
    } else if (result?.acknowledged) {
      window.location.href =
        "/courses/" + encodeURIComponent(result.insertedId);
    }
  } catch (e) {
    document.getElementById("error").innerText = "";
    if (e.error) {
      setError(e.error);
    } else if (e.message) {
      setError(e.message);
    } else {
      setError(e);
    }
  }
};

const updateSubmit = async () => {
  const courseId = document.getElementById("courseId").value;
  const courseNumber = document.getElementById("courseNumber").value;
  const courseName = document.getElementById("courseName").value;
  const courseDepartmentId =
    document.getElementById("courseDepartmentId").value;
  const courseCredits = document.getElementById("courseCredits").value;
  const courseDescription = document.getElementById("courseDescription").value;
  try {
    const csrf = document.getElementById("csrf").value;

    let requestData = {
      courseId,
      courseNumber,
      courseName,
      courseDepartmentId,
      courseCredits,
      courseDescription,
    };
    verify.string(requestData.courseName);
    verify.string(requestData.courseDescription);
    if (
      isNaN(requestData.courseCredits) ||
      requestData.courseCredits < 0 ||
      requestData.courseCredits > 30
    ) {
      throw "Invalid amount of credits";
    }

    const result = await request(
      "PUT",
      "/courses/update",
      csrf,
      requestData
    );
    if (result?.error) {
      setError(result);
    } else if (result?.acknowledged) {
      window.location.href =
        "/courses/" + encodeURIComponent(courseId);
    }
  } catch (e) {
    document.getElementById("error").innerText = "";
    if (e.error) {
      setError(e.error);
    } else if (e.message) {
      setError(e.message);
    } else {
      setError(e);
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

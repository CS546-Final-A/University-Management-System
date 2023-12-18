$("#courseRegistration").click(async function (e) {
  e.preventDefault();
  $("#yearAndSemesterSelectRegistration").modal("toggle");
  // window.location.href = `/courses/registration/`;
});
$("#courseListing").click(async function (e) {
  e.preventDefault();
  $("#yearAndSemesterSelect").modal("toggle");
});

$("#selectSemesterRegistration").click(async function (e) {
  e.preventDefault();

  const year = $("#yearRegistration").val();
  const semester = $("#semesterRegistration").val();

  const currentYear = new Date().getFullYear();
  if (year < currentYear || year > 2100) {
    alert(`Please select a valid year between ${currentYear} and 2050.`);
  } else {
    window.location.href = `/courses/${encodeURIComponent(
      year
    )}/${encodeURIComponent(semester)}/registration/`;
    $("#yearAndSemesterSelect").modal("hide");
  }
});

$("#yearAndSemesterSelectRegistration .close").on("click", function (e) {
  $("#yearAndSemesterSelectRegistration").modal("hide");
});

$("#selectSemester").click(async function (e) {
  e.preventDefault();
  const year = $("#year").val();
  const semester = $("#semester").val();

  window.location.href = `/courses/${encodeURIComponent(
    year
  )}/${encodeURIComponent(semester)}/listings/`;
});

$("#yearAndSemesterSelect .close").on("click", function (e) {
  $("#yearAndSemesterSelect").modal("hide");
});

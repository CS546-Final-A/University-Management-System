$("#courseRegistration").click(async function (e) {
  window.location.href = `/courses/registration/`;
});
$("#courseListing").click(async function (e) {
  e.preventDefault();
  $("#yearAndSemesterSelect").modal("toggle");
});

$("#selectSemester").click(async function (e) {
  e.preventDefault();
  const year = $("#year").val();
  const semester = $("#semester").val();
  // console.log(year, semester);

  window.location.href = `/courses/${year}/${semester}/listings/`;
});

$("#yearAndSemesterSelect .close").on("click", function (e) {
  $("#yearAndSemesterSelect").modal("hide");
});

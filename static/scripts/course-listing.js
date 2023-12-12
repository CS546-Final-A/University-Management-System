$("#filter-button").click(async function (e) {
  let searchTerm = $("#filter-input").val();
  console.log(searchTerm);
  let departmentFilter = $("#department-filter").val();
  console.log(departmentFilter);
  let instructorFilter = $("#instructor-filter").val();
  console.log(instructorFilter);
  let meetingDaysFilter = $("#meeting-days-filter").val();
  console.log(meetingDaysFilter);
  let deliveryModeFilter = $("#delivery-mode-filter").val();
  console.log(deliveryModeFilter);

  // Construct the query parameters
  let queryParams = new URLSearchParams();
  if (searchTerm) {
    queryParams.set("searchTerm", searchTerm);
  }
  if (departmentFilter) {
    queryParams.set("departmentFilter", departmentFilter);
  }
  if (instructorFilter) {
    queryParams.set("instructorFilter", instructorFilter);
  }
  if (meetingDaysFilter) {
    queryParams.set("meetingDaysFilter", meetingDaysFilter);
  }
  if (deliveryModeFilter) {
    queryParams.set("deliveryModeFilter", deliveryModeFilter);
  }
  if (queryParams.toString()) {
    queryParams = "?" + queryParams.toString();
  }
  // Append the query parameters to the URL
  let url = window.location.href.split("?")[0] + queryParams.toString();

  // Perform any additional logic or AJAX request using the constructed URL
  // ...

  // Redirect to the URL
  window.location.href = url;
});

$("#selectSemester").click(async function (e) {
  e.preventDefault();
  const year = $("#year").val();
  const semester = $("#semester").val();
  // console.log(year, semester);

  window.location.href = `/courses/${year}/${semester}/listings/`;
});

$(".courseRedirect").click(async function (e) {
  e.preventDefault();
  const courseID = $(this).attr("data-id");
  // console.log(courseID);
  // console.log(window.location.href);
  window.location.href = window.location.href.split("?")[0] + courseID;
});

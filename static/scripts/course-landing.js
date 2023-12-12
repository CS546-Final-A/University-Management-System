$("#courseRegistration").click(async function (e) {
  window.location.href = `/courses/registration/`;
});
$("#courseListing").click(async function (e) {
  e.preventDefault();

  window.location.href = `/courses/`;
});

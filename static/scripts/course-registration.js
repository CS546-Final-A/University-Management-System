const registerCourse = async () => {
  const courseNumber = document.getElementById("courseNumber").value;
  const courseName = document.getElementById("courseName").value;
  const courseDepartmentId =
    document.getElementById("courseDepartmentId").value;
  const courseCredits = document.getElementById("courseCredits").value;
  const courseDescription = document.getElementById("courseDescription").value;

  try {
    const csrf = document.getElementById("csrf").value;

    const result = await request("POST", "/courses/registration", csrf, {
      courseNumber,
      courseName,
      courseDepartmentId,
      courseCredits,
      courseDescription,
    });
  } catch (error) {
    console.error(error);
  }
};

const goBack = async () => {
  window.location.href = `/courses/landing`;
};

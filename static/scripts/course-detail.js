function openAddSectionModal() {
  document.getElementById("addSectionForm").reset();
  $("#addSectionModal").modal("toggle");
}

$("#addSectionModal .close").on("click", function (e) {
  $("#addSectionModal").modal("hide");
});

// Handle form submission
const sectionSubmit = async () => {

  var formData = {
    courseId: $("#courseId").val(),
    sectionName: $("#sectionName").val(),
    sectionInstructor: $("#sectionInstructor").val(),
    sectionType: $("#sectionType").val(),
    sectionStartTime: $("#sectionStartTime").val(),
    sectionEndTime: $("#sectionEndTime").val(),
    sectionDay: $("#sectionDay").val(),
    sectionCapacity: $("#sectionCapacity").val(),
    sectionLocation: $("#sectionLocation").val(),
    sectionDescription: $("#sectionDescription").val(),
  };

  // Perform AJAX request or other logic with the form data
  console.log(formData);

  const result = await request(
    "POST",
    `/courses/${formData.courseId}/section`,
    csrf,
    formData
  );
  console.log(result);
  // if (result?.error) {
  //   document.getElementById("error").innerText = result.error;
  // } else if (result?.acknowledged) {
  //   window.location.href = "/courses/" + result.insertedId;
  // }
  // Close the modal
  // $("#addSectionModal").modal("hide");
};

$("#yearAndSemesterSelect .close").on("click", function (e) {
  $("#yearAndSemesterSelect").modal("hide");
});

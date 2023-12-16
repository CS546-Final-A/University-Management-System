function openAddSectionModal()  {
  document.getElementById("addSectionForm").reset();
  document.getElementById("addSectionModalLabel").textContent = "Add Section";
  $("#addSectionModal").modal("toggle");
};
// Handle form submission
const sectionSubmit = async (event) => {
  event.preventDefault();
  const csrf = document.getElementById("csrf").value;
  const editMode = document.getElementById("editMode").value;
  const courseId = document.getElementById("courseId").value;
  const sectionName = document.getElementById("sectionName").value;
  const sectionInstructor = document.getElementById("sectionInstructor").value;
  const sectionType = document.getElementById("sectionType").value;
  const sectionStartTime = document.getElementById("sectionStartTime").value;
  const sectionEndTime = document.getElementById("sectionEndTime").value;
  const sectionDay = document.getElementById("sectionDay").value;
  const sectionCapacity = document.getElementById("sectionCapacity").value;
  const sectionLocation = document.getElementById("sectionLocation").value;
  const sectionDescription = document.getElementById("sectionDescription").value;
  try {
    if (sectionStartTime >= sectionEndTime) {
      setError("Start time must be before end time.");
      return;
    }
    let requestData = {
      courseId,
      sectionName,
      sectionInstructor,
      sectionType,
      sectionStartTime,
      sectionEndTime,
      sectionDay,
      sectionCapacity,
      sectionLocation,
      sectionDescription,
    };

    const sectionRegistrationRoute = editMode === "true" ? `/sections/${courseId}` : `/courses/${courseId}/section`;

    const result = await request(
      editMode === "true" ? "PUT" : "POST",
      sectionRegistrationRoute,
      csrf,
      requestData
    );
    if (result?.error) {
      document.getElementById("error").innerText = result.error;
    } else if (result?.acknowledged) {
      window.location.href = "/courses/" + courseId;
    }

    $("#addSectionModal").modal("hide");
  } catch (e) {
    document.getElementById("error").innerText = "";
    if (e.error) {
      setError(e.error);
    } else {
      setError(e.message);
    }
  }
};

const editSection = async (sectionId) => {
  document.getElementById("addSectionModalLabel").textContent = "Update Section";
  const csrf = document.getElementById("csrf").value;
  let section;
  try {
    const getSection = `/sections/${sectionId}`;
    section = await request("GET", getSection, csrf);

    document.getElementById("addSectionForm").reset();
    $("#addSectionModal").modal("toggle");
  } catch (error) {
    console.log(error.message);
  }
  document.getElementById("courseId").value = section.courseId;
  document.getElementById("sectionName").value = section.sectionName;
  document.getElementById("sectionInstructor").value = section.sectionInstructor;
  document.getElementById("sectionType").value = section.sectionType;
  document.getElementById("sectionStartTime").value = section.sectionStartTime;
  document.getElementById("sectionEndTime").value = section.sectionEndTime;
  document.getElementById("sectionDay").value = section.sectionDay;
  document.getElementById("sectionCapacity").value = section.sectionCapacity;
  document.getElementById("sectionLocation").value = section.sectionLocation;
  document.getElementById("sectionDescription").value = section.sectionDescription;

  
};

const deleteSection = async (sectionId) => {
  const csrf = document.getElementById("csrf").value;
  let deleteInfo;
  try {
    const deleteSection = `/sections/${sectionId}`;
    deleteInfo = await request("DELETE", deleteSection, csrf);
    if (deleteInfo?.error) {
      document.getElementById("error").innerText = result.error;
    } else if (deleteInfo?.acknowledged) {
      window.location.href = "/courses/" + deleteInfo.courseId;
    }
  } catch (error) {
    console.log(error.message);
  }
};

function setError(error) {
  // Reset the fadout animation and overwrite text
  const errdiv = document.getElementById("error");
  errdiv.innerText = error;
  errdiv.style.animationName = "";
  errdiv.offsetHeight;
  errdiv.style.animationName = "fadeout";
}

$(document).ready(function () {
  $("#addSectionModal .close").on("click", function (e) {
    $("#addSectionModal").modal("hide");
  });
});

function openAddSectionModal() {
  document.getElementById("addSectionForm").reset();
  document.getElementById("editMode").value = "false";
  document.getElementById("addSectionModalLabel").textContent = "Add Section";
  $("#addSectionModal").modal("toggle");
}
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
  const sectionDescription =
    document.getElementById("sectionDescription").value;
  try {
    if (sectionStartTime >= sectionEndTime) {
      setError("Start time must be before end time.", "error");
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

    if (editMode === "true") {
      requestData.sectionId = document.getElementById("sectionId").value;
    }

    const sectionRegistrationRoute =
      editMode === "true"
        ? `/sections/${requestData.sectionId}`
        : `/sections/${courseId}/section`;

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
      setError(e.error, "error");
    } else {
      setError(e.message, "error");
    }
  }
};

const editSection = async (sectionId) => {
  document.getElementById("editMode").value = "true";
  document.getElementById("addSectionModalLabel").textContent =
    "Update Section";
  const csrf = document.getElementById("csrf").value;
  let section;
  try {
    const getSection = `/sections/${sectionId}`;
    section = await request("GET", getSection, csrf);

    document.getElementById("addSectionForm").reset();
    document.getElementById("courseId").value = section.courseId;
    document.getElementById("sectionId").value = sectionId;
    document.getElementById("sectionName").value = section.sectionName;
    document.getElementById("sectionInstructor").value =
      section.sectionInstructor;
    document.getElementById("sectionType").value = section.sectionType;
    document.getElementById("sectionStartTime").value =
      section.sectionStartTime;
    document.getElementById("sectionEndTime").value = section.sectionEndTime;
    document.getElementById("sectionDay").value = section.sectionDay;
    document.getElementById("sectionCapacity").value = section.sectionCapacity;
    document.getElementById("sectionLocation").value = section.sectionLocation;
    document.getElementById("sectionDescription").value =
      section.sectionDescription;
    $("#addSectionModal").modal("toggle");
  } catch (e) {
    document.getElementById("tableError").innerText = "";
    if (e.error) {
      setError(e.error, "tableError");
    } else {
      setError(e.message, "tableError");
    }
  }
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
      const errdiv = document.getElementById("tableError");
      errdiv.innerText = "";
      window.location.href = "/courses/" + deleteInfo.courseId;
    }
  } catch (e) {
    document.getElementById("tableError").innerText = "";
    if (e.error) {
      setError(e.error, "tableError");
    } else {
      setError(e.message, "tableError");
    }
  }
};

const enrollSection = async (sectionId) => {
  const csrf = document.getElementById("csrf").value;
  let enrollInfo;
  try {
    const enrollSection = `/courses/${sectionId}/enroll`;
    enrollInfo = await request("GET", enrollSection, csrf);
    const courseId = document.getElementById("courseId").value;
    if (enrollInfo?.error) {
      document.getElementById("tableError").innerText = result.error;
      // setError(result.error, "tableError");
    } else 
    if (enrollInfo?.acknowledged) {
      const errdiv = document.getElementById("tableError");
      errdiv.innerText = "";
      window.location.href = "/courses/" + courseId;
    }
  } catch (e) {
    document.getElementById("tableError").innerText = "";
    if (e.error) {
      setError(e.error, "tableError");
    } else {
      setError(e.message, "tableError");
    }
  }
};

const discardSection = async (sectionId) => {
  const csrf = document.getElementById("csrf").value;
  let discardInfo;
  try {
    const discardSection = `/courses/${sectionId}/discard`;
    discardInfo = await request("GET", discardSection, csrf);
    const courseId = document.getElementById("courseId").value;
    if (discardInfo?.error) {
      document.getElementById("tableError").innerText = result.error;
      // setError(result.error, "tableError");
    } else 
    if (discardInfo?.acknowledged) {
      const errdiv = document.getElementById("tableError");
      errdiv.innerText = "";
      window.location.href = "/courses/" + courseId;
    }
  } catch (e) {
    document.getElementById("tableError").innerText = "";
    if (e.error) {
      setError(e.error, "tableError");
    } else {
      setError(e.message, "tableError");
    }
  }
};

function setError(error, id) {
  // Reset the fadout animation and overwrite text
  const errdiv = document.getElementById(id);
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

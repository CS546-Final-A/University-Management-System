$("#addModalButton").click(async function (e) {
  e.preventDefault();
  document.getElementById("addFormError").innerText = "";
  document.getElementById("addDepartmentName").value = "";
  $("#addModal").modal("toggle");
  // window.location.href = `/courses/registration/`;
});

$("#addModal .close").on("click", function (e) {
  $("#addModal").modal("hide");
});


$("#editModal .close").on("click", function (e) {
  $("#editModal").modal("hide");
});

const submitForm = async (event) => {
  event.preventDefault();
  document.getElementById("addFormError").innerText = "";

  const departmentName = document.getElementById("addDepartmentName").value;

  try {
    const csrf = document.getElementById("csrf").value;

    let requestData = {
      departmentName,
    };

    const result = await request(
      "POST",
      "/configuration/departments/register",
      csrf,
      requestData
    );

    if (result?.error) {
      setError(result.error, "addFormError");
    } else if (result?.acknowledged) {
      window.location.href = "/configuration/departments";
    }
  } catch (e) {
    document.getElementById("addFormError").innerText = "";
    if (e.error) {
      setError(e.error, "addFormError");
    } else {
      setError(e.message, "addFormError");
    }
  }
};

const openEditModal = async (id, name) => {
  document.getElementById("editFormError").innerText = "";
  document.getElementById("editDepartmentId").value = id;
  document.getElementById("editDepartmentName").value = name;
  $("#editModal").modal("toggle");
};

const submitEditForm = async (event) => {
    event.preventDefault();
    document.getElementById("addFormError").innerText = "";
  

    const departmentId = document.getElementById("editDepartmentId").value;
    const departmentName = document.getElementById("editDepartmentName").value;
  try {
    const csrf = document.getElementById("csrf").value;
    let requestData = {
      departmentName,
    };
    const result = await request(
      "PUT",
      `/configuration/departments/update/${departmentId}`,
      csrf,
      requestData
    );
    if (result?.error) {
      setError(result.error, "editFormError");
    } else if (result?.acknowledged) {
      window.location.href = "/configuration/departments";
    }
  } catch (e) {
    document.getElementById("editFormError").innerText = "";
    if (e.error) {
      setError(e.error, "editFormError");
    } else {
      setError(e.message, "editFormError");
    }
  }
};

function setError(error, id) {
  const errdiv = document.getElementById(id);
  errdiv.innerText = error;
  errdiv.style.animationName = "";
  errdiv.offsetHeight;
  errdiv.style.animationName = "fadeout";
}

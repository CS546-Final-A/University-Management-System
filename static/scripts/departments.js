$("#addModalButton").click(async function (e) {
  e.preventDefault();
  $("#addFormError").text("");
  $("#addDepartmentName").val("");
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
  $("#addFormError").text("");
  try {
    const departmentName = verify.string($("#addDepartmentName").val());

    const csrf = $("#csrf").val();

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
    $("#addFormError").text("");
    if (e.error) {
      setError(e.error, "addFormError");
    } else if (e.message) {
      setError(e.message, "addFormError");
    } else {
      setError(e, "addFormError");
    }
  }
};

const openEditModal = async (id, name) => {
  $("#editFormError").text("");
  $("#editDepartmentId").val(id);
  $("#editDepartmentName").val(name);
  $("#editModal").modal("toggle");
};

const submitEditForm = async (event) => {
  event.preventDefault();
  $("#addFormError").text("");
  try {
    const departmentId = $("#editDepartmentId").val();
    const departmentName = verify.string($("#editDepartmentName").val());
    const csrf = $("#csrf").val();
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
    $("#editFormError").text("");
    if (e.error) {
      setError(e.error, "editFormError");
    } else if (e.message) {
      setError(e.message, "editFormError");
    } else {
      setError(e, "editFormError");
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

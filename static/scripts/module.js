document.getElementById("addModuleButton").addEventListener("click", () => {
  document.getElementById("moduleForm").style.display = "block";
});

document
  .getElementById("moduleFormBtn")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const moduleName = verify.string(
        document.getElementById("moduleName").value
      );
      const moduleDesc = verify.string(
        document.getElementById("moduleDesc").value
      );
      const moduleDate = verify.string(
        document.getElementById("moduleDate").value
      );
      const pathSegments = window.location.pathname.split("/");
      const sectionId = pathSegments[2];
      const response = await fetch(`/sections/${sectionId}/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.getElementById("csrf").value,
        },
        body: JSON.stringify({
          moduleName,
          moduleDescription: moduleDesc,
          moduleDate,
        }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        setError("Failed to add module");
      }
    } catch (error) {
      setError(error);
    }
  });

function setError(error) {
  var toastRed1 = $("html").css("--toastRed1");
  $(".toast-header").css("background-color", toastRed1);
  $(".toast-header").css("color", "#000000");
  $(".toast-header .me-auto").html("&nbsp;&nbsp;Login Failed");

  // $(".toast-body").css("background-color", toastRed2);
  $(".toast-body").css("color", "#000000");
  $(".toast-body").text(error);
  $("#liveToast").toast("show");
}

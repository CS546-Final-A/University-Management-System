$(document).ready(function () {
  document
    .getElementById("uploadForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const myFiles = document.getElementById("myFiles").files;

      if (myFiles.length === 0) {
        return alert("Please select a file");
      }
      if (myFiles.length > 1) {
        return alert("Please select only one file");
      }
      const formData = new FormData();

      Object.keys(myFiles).forEach((key) => {
        formData.append(myFiles.item(key).name, myFiles.item(key));
      });

      const response = await fetch(window.location.href, {
        method: "POST",
        body: formData,
      });
      const json = await response.json();

      document.getElementById("status").textContent = json?.status;
      document.getElementById("message").textContent = json?.message;

      console.log(json);
    });
});

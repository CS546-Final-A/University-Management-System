function sendform() {
  let sending = false;
  return async function (e) {
    e.preventDefault();
    sending = true;
    if (
      !confirm(
        "If you proceed you will not be able to change the student's grade in the future.\n\nAre you sure you wish to proceed?"
      )
    ) {
      sending = false;
      return;
    }
    const form = e.target;
    const userid = form[0].value;
    const grade = form[1].value;
    const csrf = form[2].value;
    try {
      const result = await request("POST", window.location.pathname, csrf, {
        studentid: userid,
        grade: grade,
      });

      if (result.successful) {
        form[3].disabled = true;
        form[3].classList.add("btn-secondary");
        form[3].classList.remove("btn-info");
      } else {
        throw "Unexpected result from server";
      }
    } catch (e) {
      if (e.error) {
        alert(e.error);
      } else {
        alert(e);
      }
      sending = false;
    }
  };
}

$(".submitform").on("submit", sendform());

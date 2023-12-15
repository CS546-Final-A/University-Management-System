function requestDelete() {
  let sent = false;

  return async function (e) {
    e.preventDefault();
    sent = true;

    if (confirm("Are you sure you want to delete this assignment?")) {
      const csrf = e.target.csrf;
      const requesturl = e.target.value;

      const result = await request("DELETE", requesturl, csrf);
    } else {
      sending = false;
    }
  };
}

$(".btn-danger").click(requestDelete());

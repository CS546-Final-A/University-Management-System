function formatssn() {
  const location = document.getElementById("identification");
  let ssn = location.value;

  const ssnarr = ssn.split("");
  ssn = "";

  for (let char of ssnarr) {
    if (/\d/.test(char)) {
      ssn = ssn + char;
    }
  }

  ssn = ssn.replace(/^(\d{3})/, "$1-");
  ssn = ssn.replace(/-(\d{2})/, "-$1-");

  location.value = ssn;
}
function lengthlimit() {
  const location = document.getElementById("identification");
  let ssn = location.value;

  if (ssn.length - ssn.split("-").length + 1 > 9) {
    ssn = ssn.substr(0, 9 + ssn.split("-").length - 1);
    location.value = ssn;
  }
}

function submitform() {
  let sending = false;
  return async function () {
    if (sending) {
      return;
    }
    sending = true;
    const firstname = verify.name(document.getElementById("firstname").value);
    const lastname = verify.name(document.getElementById("lastname").value);
    const email = verify.email(document.getElementById("email").value);
    const ssn = verify.ssn(document.getElementById("identification").value);
    const type = verify.accountype(document.getElementById("type").value);

    const data = {
      firstname: firstname,
      lastname: lastname,
      email: email,
      identification: { type: "ssn", number: ssn },
      accountype: type,
    };
  };
}

document
  .getElementById("identification")
  .addEventListener("focusout", formatssn);
document
  .getElementById("identification")
  .addEventListener("input", lengthlimit);

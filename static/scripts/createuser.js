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

function adduser() {
  let sending = false;
  const csrf = document.getElementById("csrf").value;
  return async function (event) {
    event.preventDefault();
    if (sending) {
      return;
    }
    sending = true;
    try {
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

      const result = await request("PUT", "/users/create", csrf, data);
      console.log(result);
      sending = false;
    } catch (e) {
      sending = false;
      console.log(e);
    }
  };
}

document
  .getElementById("identification")
  .addEventListener("focusout", formatssn);
document
  .getElementById("identification")
  .addEventListener("input", lengthlimit);

document.getElementById("newuserform").addEventListener("submit", adduser());

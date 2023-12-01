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
    formatssn();
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
      if (result.successful) {
        document.getElementById(
          "status"
        ).innerText = `${firstname} ${lastname} successfully added.`;
      }
    } catch (e) {
      document.getElementById("status").innerText = "";
      if (e.error) {
        setError(e.error);
      } else {
        setError(e);
      }
    } finally {
      sending = false;
    }
  };
}

function setError(error) {
  // Reset the fadout animation and overwrite text
  const errdiv = document.getElementById("error");
  errdiv.innerText = error;
  errdiv.style.animationName = "";
  errdiv.offsetHeight;
  errdiv.style.animationName = "fadeout";
}

document
  .getElementById("identification")
  .addEventListener("focusout", formatssn);
document
  .getElementById("identification")
  .addEventListener("input", lengthlimit);

document.getElementById("newuserform").addEventListener("submit", adduser());

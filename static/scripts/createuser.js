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

document
  .getElementById("identification")
  .addEventListener("focusout", formatssn);

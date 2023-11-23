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

document
  .getElementById("identification")
  .addEventListener("focusout", formatssn);
document
  .getElementById("identification")
  .addEventListener("input", lengthlimit);

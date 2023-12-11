function inputfix() {
  const idnum = document.getElementById("id-confirmation").value;
  let saninput = "";
  for (let char of idnum) {
    if (!isNaN(char)) {
      saninput = saninput + char;
    }
  }
  document.getElementById("id-confirmation").value = saninput;
}

document.getElementById("id-confirmation").addEventListener("input", inputfix);

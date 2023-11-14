async function request(method, target, csrf, data) {
  const methods = ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH"];
  if (
    typeof method != "string" ||
    typeof target != "string" ||
    typeof csrf != "string" ||
    (typeof data != "object" && typeof data != "undefined")
  ) {
    throw "Invalid arguments";
  }
  if (!methods.includes(method.trim().toUpperCase())) {
    throw "Invalid method";
  }
  if (target.trim().length < 1) {
    throw "Invalid target";
  }
  method = method.trim().toUpperCase();
  target = target.trim();

  try {
    const response = await fetch(target, {
      method: method,
      headers: {
        "Content-type": "application/json; charset=utf-8",
        "X-CSRF-Token": csrf,
      },
      body: JSON.stringify(data),
    });
    const result = await response.text();
    return result;
  } catch (e) {
    throw e;
  }
}

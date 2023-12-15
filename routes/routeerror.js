function routeError(res, e) {
  if (e.status) {
    res.status(e.status);
    if (e.status >= 500) {
      console.log("Error:");
      console.log(e.message);
      e.message = "Internal server error";
    }
    return res.render("public/error", { error: e.message });
  } else {
    console.log("Error:");
    console.log(e);
    res.status(500);
    return res.render("public/error", { error: "Internal server error" });
  }
}

export default routeError;

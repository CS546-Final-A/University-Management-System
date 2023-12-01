function adminsOnly(req, res, next) {
  if (req.session.type === "Admin") {
    return next();
  } else {
    return res.redirect("/");
  }
}

export default adminsOnly;

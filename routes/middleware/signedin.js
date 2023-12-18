function signin(req, res, next) {
  if (req.session.userid) {
    next();
  } else {
    res.redirect("/login/");
  }
}

export default signin;

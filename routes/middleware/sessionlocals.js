function sessionLocals(req, res, next) {
  if (req.session.userid) {
    res.locals.session_userid = req.session.userid;
    res.locals.session_name = req.session.name;
    res.locals.session_type = req.session.type;
    res.locals.session_email = req.session.email;
    res.locals.darkmode = req.session.darkmode;
  } else {
    res.locals.darkmode = 0;
  }
  next();
}

export default sessionLocals;

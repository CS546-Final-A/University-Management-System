import { Router } from "express";
import * as sectionData from "../data/sections/sections.js";
import * as courseData from "../data/courses/courses.js";
import getUserByID from "../data/users/getUserInfoByID.js";

const router = Router();

router.get("/", async (req, res) => {
  let renderObjs = {
    name: req.session.name,
    type: req.session.type,
    email: req.session.email,
  };

  if (req.session.type === "Admin") {
    return res.render("admin/dashboard", renderObjs);
  } else {
    const userInfo = await getUserByID(req.session.userid);

    let tempArr = [];
    for (let i = 0; i < userInfo.registeredCourses.length; i++) {
      tempArr.push(userInfo.registeredCourses[i]);
    }

    const requestedSections = await sectionData.getSectionsByIds(tempArr);
    tempArr = [];
    for (let i = 0; i < requestedSections.length; i++) {
      tempArr.push(requestedSections[i].courseId);
    }

    const requestedCourses = await courseData.getCoursesByIds(tempArr);
    console.log(requestedCourses);

    return res.render("public/dashboard", renderObjs);
  }
});

export default router;

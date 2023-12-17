import { Router } from "express";
import pdfkit from "pdfkit";

import routeError from "../routeerror.js";
import { getgrade } from "../../data/assignments/finalizegrades.js";
import { courses } from "../../config/mongoCollections.js";

const router = Router();

// Used https://stackoverflow.com/questions/23624005/generate-pdf-file-using-pdfkit-and-send-it-to-browser-in-nodejs-expressjs

router.get("/", async (req, res) => {
  try {
    if (req.session.type !== "Student") {
      throw { status: 403, message: "Only students have a transcript" };
    }
    const coursecol = await courses();

    const studentcourses = await coursecol
      .find({
        sections: {
          $elemMatch: {
            students: req.session.userid,
          },
        },
      })
      .sort({
        courseYear: 1,
        courseSemester: 1,
      })
      .toArray();

    const doc = new pdfkit();
    doc.pipe(res);

    res.set("Content-Type", "application/pdf");
    res.set(
      "Content-disposition",
      `attachment;filename=${req.session.name} Transcript.pdf`
    );

    doc.font("Times-Roman").text(`Transcript for ${req.session.name}`);
    let credits = 0;
    let gradepoints = 0;
    let activesemester = "";
    for (let course of studentcourses) {
      let grade = await getgrade(course.sectionId, req.session.userid);
      if (grade) {
        let gpamult = 0;
        switch (lettergrade) {
          case "A":
            gpamult = 4;
            break;
          case "A-":
            gpamult = 3.7;
            break;
          case "B+":
            gpamult = 3.4;
            break;
          case "B":
            gpamult = 3.0;
            break;
          case "B-":
            gpamult = 2.7;
            break;
          case "C+":
            gpamult = 2.4;
            break;
          case "C":
            gpamult = 2.0;
            break;
          case "C-":
            gpamult = 1.7;
            break;
          case "D":
            gpamult = 1;
            break;
          case "F":
            gpamult = 0;
            break;
        }
        credits += course.courseCredits;
        gradepoints = course.courseCredits * gpamult;
      } else {
        grade = "";
      }
      if (activesemester !== course.courseSemester + course.courseYear) {
        activesemester = course.courseSemester + course.courseYear;
        doc.font("Times-Bold").text(activesemester);
      }
      doc
        .font("Times-Roman")
        .text(
          `Course:${course.courseName}\ncredits:${course.courseCredits}\nGrade:${grade}`
        );
    }
    let gpa = gradepoints / credits;

    if (isNaN(gpa)) {
      gpa = 0;
    }
    doc.font("Times-Bold").text(`Credits Earned: ${credits}\nGPA:${gpa}`);

    doc.end();
  } catch (e) {
    routeError(res, e);
  }
});

export default router;

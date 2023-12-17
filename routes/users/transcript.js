import { Router } from "express";

import routeError from "../routeerror.js";
import { getgrade } from "../../data/assignments/finalizegrades.js";
import { courses } from "../../config/mongoCollections.js";
import verify from "../../data_validation.js";
import htmlToPdf from "html-pdf";

const router = Router();

// Used https://stackoverflow.com/questions/23624005/generate-pdf-file-using-pdfkit-and-send-it-to-browser-in-nodejs-expressjs
function findSectionByStudentId(studentId, courses) {
  let sections = [];
  for (const course of courses) {
    for (const section of course.sections) {
      const foundStudent = section.students.find(
        (student) => student.toString() === studentId
      );
      if (foundStudent) {
        sections.push({
          sectionId: section.sectionId,
          courseName: course.courseName,
          courseCredits: course.courseCredits,
          courseSemester: course.courseSemester,
          courseYear: course.courseYear,
        });
      }
    }
  }

  return sections; // Section not found
}

router.get("/", async (req, res) => {
  try {
    if (req.session.type !== "Student") {
      throw { status: 403, message: "Only students have a transcript" };
    }
    const coursecol = await courses();
    let studentId = verify.validateMongoId(req.session.userid);
    const studentcourses = await coursecol
      .find({
        sections: {
          $elemMatch: {
            students: studentId,
          },
        },
      })
      .sort({
        courseYear: 1,
        courseSemester: 1,
      })
      .toArray();
    const sections = findSectionByStudentId(req.session.userid, studentcourses);

    // Group sections by semester and year
    const groupedSections = sections.reduce((acc, section) => {
      const key = section.courseSemester + section.courseYear;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(section);
      return acc;
    }, {});

    let credits = 0;
    let gradepoints = 0;
    let activesemester = "";

    let htmlContent = `
       <html>
        <head>
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <h2>Transcript for ${req.session.name}</h2>
          <table>
            
          `;
    for (const semesterKey in groupedSections) {
      htmlContent += `<tr><td colspan="3"><strong>${semesterKey}</strong></td></tr>
      <tr>
        <th>Course Name</th>
        <th>Credits</th>
        <th>Grade</th>
      </tr>`;
      for (let section of groupedSections[semesterKey]) {
        let grade = await getgrade(
          section.sectionId.toString(),
          req.session.userid
        );
        if (grade) {
          let gpamult = 0;
          switch (grade) {
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
          credits += section.courseCredits;
          gradepoints = section.courseCredits * gpamult;
        } else {
          grade = "";
        }
        htmlContent += `
          <tr>
            <td>${section.courseName}</td>
            <td>${section.courseCredits}</td>
            <td>${grade}</td>
          </tr>`;
      }
    }

    // Add summary information
    let gpa = gradepoints / credits;
    if (isNaN(gpa)) {
      gpa = 0;
    }
    htmlContent += `
      </table>
      <p><strong>Credits Earned:</strong> ${credits}</p>
      <p><strong>GPA:</strong> ${gpa.toFixed(2)}</p>
    </body></html>`;

    // Create PDF from HTML content
    htmlToPdf.create(htmlContent).toBuffer((err, buffer) => {
      try {
        if (err) {
          throw err;
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-disposition",
          `attachment;filename=${req.session.name} Transcript.pdf`
        );
        res.send(buffer);
      } catch (e) {
        routeError(res, e);
      }
    });
  } catch (e) {
    routeError(res, e);
  }
});

export default router;

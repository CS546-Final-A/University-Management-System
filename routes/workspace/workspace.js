import { Router } from "express";
const router = Router();
import {
  addStudentToAttendance,
  getAttendanceData,
} from "../../data/attendance/attendance.js";
import {
  addModuleToSection,
  getModuleById,
  uploadMaterial,
} from "../../data/modules/modules.js";
import * as courseData from "../../data/courses/courses.js";
import getUserByID from "../../data/users/getUserInfoByID.js";
import belongsincourse from "../../data/courses/belongsincourse.js";
import assignmentRoutes from "./assignments.js";
import verify, { santizeInputs } from "../../data_validation.js";
import fileUpload from "express-fileupload";
import path from "path";
import filesPayloadExists from "../../routes/middleware/filesPayloadExists.js";
import fileExtLimiter from "../../routes/middleware/fileExtLimiter.js";
import fileSizesLimiter from "../../routes/middleware/fileSizeLimiter.js";
import * as courseDataFunctions from "../../data/courses/courses.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

router.use("/:sectionID*", async (req, res, next) => {
  res.locals.sectionID = req.params.sectionID;
  res.locals.layout = "sidebar";
  try {
    const sectionID = verify.validateMongoId(res.locals.sectionID, "SectionID");
    if (await belongsincourse(req.session.userid, sectionID)) {
      next();
    } else {
      res.status(403);
      res.render("public/error", {
        error: "You are not enrolled in this course",
      });
    }
  } catch (e) {
    if (e.status !== 500 && e.status) {
      res.status(e.status);
      return res.render("public/error", {
        error: e.message,
      });
    } else {
      console.log(e);
      res.status(500);
      return res.render("public/error", {
        error: "Internal Server Error",
      });
    }
  }
});

router.route("/:sectionId").get(async (req, res) => {
  let renderObjs = {};

  const section = await courseData.getSectionById(res.locals.sectionID);
  const course = await courseData.getCourseById(section.courseId.toString());

  const profName = await getUserByID(section.sectionInstructor, {
    _id: 0,
    firstname: 1,
    lastname: 1,
  });

  renderObjs = {
    ...renderObjs,
    layout: "sidebar",
    sideBarTitle: course[0].courseName,
    courseId: section.courseId.toString(),
    courseName: course[0].courseName,
    sectionName: section.sectionName,
    sectionInstructor: section.sectionInstructor,
    fN: profName.firstname,
    lN: profName.lastname,
    sectionType: section.sectionType,
    sectionStartTime: section.sectionStartTime,
    sectionEndTime: section.sectionEndTime,
    sectionDay: section.sectionDay,
    sectionCapacity: section.sectionCapacity,
    sectionYear: section.sectionYear,
    sectionSemester: section.sectionSemester,
    studentCount: section.students.length,
    sectionLocation: section.sectionLocation,
    sectionDescription: section.sectionDescription,
  };
  res.render("workspace/home", renderObjs);
});
router
  .route("/:sectionId/modules")
  .get(async (req, res) => {
    let sectionId = verify.validateMongoId(req.params.sectionId);

    let renderObjs = {};
    const section = await courseData.getSectionById(sectionId);
    const userType = req.session.type;

    renderObjs = {
      ...renderObjs,
      layout: "sidebar",
      // sideBarTitle: `${course.courseName}`,
      modules: section.sectionModules,
      userType,
    };
    res.render("workspace/module", renderObjs);
  })
  .post(async (req, res) => {
    req.body = santizeInputs(req.body);
    const { sectionId } = req.params;
    sectionId = verify.validateMongoId(req.params.sectionId);
    const { moduleName, moduleDescription, moduleDate } = req.body;
    try {
      await addModuleToSection(
        sectionId,
        moduleName,
        moduleDescription,
        moduleDate
      );

      res.status(200).json({ message: "module added successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Implementation of the Haversine formula
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1000; // Convert to meters
  return distance;
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

router
  .route("/:sectionId/modules/:moduleId/attendance")
  .get(async (req, res) => {
    let renderObjs = {};
    let { sectionId, moduleId } = req.params;
    let userId = req.session.userid;
    userId = verify.validateMongoId(userId);
    moduleId = verify.validateMongoId(moduleId);
    let section = await courseDataFunctions.checkStudentInSection(
      sectionId,
      userId
    );

    if (!section) {
      throw new Error("Section not found");
    }
    if (req.session.type === "Professor") {
      const userType = req.session.type;
      try {
        const attendanceData = await getAttendanceData(moduleId);
        console.log(attendanceData);

        const professor = await attendanceData.find(
          (entry) => entry.type === "Professor"
        );
        let needButton = true;
        if (professor) needButton = false;

        let studentsWithinRange = [];
        if (professor) {
          const professorLocation = {
            latitude: professor.latitude,
            longitude: professor.longitude,
          };

          if (attendanceData) {
            studentsWithinRange = attendanceData
              .filter((entry) => entry.type === "Student")
              .map((student) => {
                const studentLocation = {
                  latitude: student.latitude,
                  longitude: student.longitude,
                };
                const distance = calculateDistance(
                  professorLocation.latitude,
                  professorLocation.longitude,
                  studentLocation.latitude,
                  studentLocation.longitude
                );
                return {
                  name: student.name,
                  userId: student.userId,
                  distanceFromProfessor: distance,
                };
              })
              .filter((student) => student.distanceFromProfessor <= 20);
          }
        }
        if (studentsWithinRange) {
          const name = req.session.name;
          renderObjs = {
            ...renderObjs,
            layout: "sidebar",
            // sideBarTitle: `${course.courseName}`,
            userType,
            name,
            studentsWithinRange,
            needButton,
          };
          res.status(200).render("workspace/attendance", renderObjs);
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      const attendanceData = await getAttendanceData(moduleId);
      const professor = await attendanceData.find(
        (entry) => entry.type === "Professor"
      );
      let needButton = false;
      let n = 0;
      const userType = req.session.type;
      const name = req.session.name;
      if (!professor) {
        n = 1;
        renderObjs = {
          ...renderObjs,
          layout: "sidebar",
          // sideBarTitle: `${course.courseName}`,
          sectionID: sectionId,
          userType,
          name,
          n,
        };
        res.render("workspace/attendance", renderObjs);
      } else {
        const ts = professor.timeStamp;
        const date = new Date(ts);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let amOrPm = hours >= 12 ? "PM" : "AM";
        let H = hours;
        let M = minutes < 10 ? "0" + minutes : minutes;
        let k = amOrPm;
        const userFromDb = await attendanceData.find(
          (entry) => entry.userId === req.session.userid
        );
        let userThereButton = false;
        if (userFromDb) userThereButton = true;
        if (professor) needButton = true;
        let t = new Date();
        let timeLeft = t.getTime() - ts < 600000 ? true : false;
        if (needButton === false) n = 1;
        if (
          needButton === true &&
          userThereButton === false &&
          timeLeft === true
        )
          n = 2;
        if (
          needButton === true &&
          userThereButton === false &&
          timeLeft === false
        )
          n = 3;
        if (needButton === true && userThereButton === true) n = 4;
        renderObjs = {
          ...renderObjs,
          layout: "sidebar",
          // sideBarTitle: `${course.courseName}`,
          sectionID: sectionId,
          userType,
          name,
          n,
          H,
          M,
          k,
        };
        res.render("workspace/attendance", renderObjs);
      }
    }
  })
  .post(async (req, res) => {
    req.body = santizeInputs(req.body);
    const moduleId = req.params.moduleId;
    const userId = req.session.userid;
    const name = req.session.name;
    const type = req.session.type;
    const { latitude, longitude } = req.body;
    const attendanceData = await getAttendanceData(moduleId);
    const now = new Date();
    const timeStamp = now.getTime();

    const professor = await attendanceData.find(
      (entry) => entry.type === "Professor"
    );
    if (professor) {
      const d = calculateDistance(
        latitude,
        longitude,
        professor.latitude,
        professor.longitude
      );
      if (d > 0.1) alert("you'll be marked absent ");
    }
    try {
      await addStudentToAttendance(
        name,
        userId,
        moduleId,
        latitude,
        longitude,
        type,
        timeStamp
      );

      res.status(200).json({ message: "Attendance marked successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

router.use("/:sectionId/assignments", assignmentRoutes);

router.post(
  "/:sectionId/modules/:moduleId/upload",
  fileUpload({ createParentPath: true }),
  filesPayloadExists,
  fileExtLimiter([".zip"]),
  fileSizesLimiter,

  async (req, res) => {
    try {
      req.body = santizeInputs(req.body);
      const files = req.files;
      let { sectionId, moduleId } = req.params;
      let userId = req.session.userid;
      userId = verify.validateMongoId(userId);
      moduleId = verify.validateMongoId(moduleId);
      let section = await courseDataFunctions.checkStudentInSection(
        sectionId,
        userId
      );

      if (!section) {
        throw new Error("Section not found");
      }

      let module = await getModuleById(moduleId);

      if (!module) {
        throw new Error("Assignment not found");
      }
      let fileName = "";
      Object.keys(files).forEach((key) => {
        const filepath = path.join(
          "files",
          moduleId.toString(),
          userId.toString(),
          files[key].name
        );
        fileName = files[key].name;
        console.log(filepath);
        files[key].mv(filepath, (err) => {
          if (err)
            return res.status(500).json({ status: "error", message: err });
        });
      });

      let material = await uploadMaterial(
        moduleId,
        Date.now().toString(),
        fileName
      );
      res.send({ status: "success", message: "File is uploaded" });
    } catch (e) {
      if (e.status !== 500 && e.status) {
        return res
          .status(e.status)
          .json({ status: "Error", message: e.message });
      } else {
        console.log(e);
        res.status(500);
        res.json({ error: "Login error" });
      }
    }
  }
);

export default router;

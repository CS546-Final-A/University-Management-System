import { Router } from "express";
const router = Router();
import {
  addStudentToAttendance,
  getAttendanceData,
} from "../../data/attendance/attendance.js";
import * as courseData from "../../data/courses/courses.js";
import getUserByID from "../../data/users/getUserInfoByID.js";

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}
router.route("/:sectionId").get(async (req, res) => {
  const section = await courseData.getSectionById(req.params.sectionId);
  const course = await courseData.getCourseById(section.courseId.toString());

  const profName = await getUserByID(section.sectionInstructor, {
    _id: 0,
    firstname: 1,
    lastname: 1,
  });

  res.render("workspace/section", {
    layout: "sidebar",
    sectionID: `${section.sectionId}`,
    courseId: `${section.courseId.toString()}`,
    courseName: `${course.courseName}`,
    sectionName: `${section.sectionName}`,
    sectionInstructor: `${section.sectionInstructor}`,
    fN: `${profName.firstname}`,
    lN: `${profName.lastname}`,
    sectionType: `${section.sectionType}`,
    sectionStartTime: `${section.sectionStartTime}`,
    sectionEndTime: `${section.sectionEndTime}`,
    sectionDay: `${section.sectionDay}`,
    sectionCapacity: `${section.sectionCapacity}`,
    sectionYear: `${section.sectionYear}`,
    sectionSemester: `${section.sectionSemester}`,
    students: `${section.students}`,
    sectionLocation: `${section.sectionLocation}`,
    sectionDescription: `${section.sectionDescription}`,
  });
});
router.route("/:sectionId/modules").get(async (req, res) => {
  const section = await courseData.getSectionById(req.params.sectionId);
  res.render("workspace/module", {
    modules: section.sectionModules,
    sectionID: `${section.sectionId}`,
  });
});

router
  .route("/:sectionId/modules/:moduleId/attendance")
  .get(async (req, res) => {
    const { sectionId, moduleId } = req.params;
    if (req.session.type === "Professor") {
      const userType = req.session.type;
      try {
        const attendanceData = await getAttendanceData(sectionId, moduleId);
        console.log(attendanceData);
        // const attendees = [];

        // const position = await getCurrentPosition();
        // console.log(position);
        // const { latitude, longitude } = position.coords;
        // for (const i of await attendanceData) {
        //   let d = calculateDistance(
        //     i.latitude,
        //     i.longitude,
        //     latitude,
        //     longitude
        //   );
        //   console.log("d=");
        //   console.log(d);
        //   if (d <= 0.01) {
        //     const attendee = await getUserByID(iterator.userId, {
        //       _id: 0,
        //       firstname: 1,
        //       lastname: 1,
        //     });

        //     attendees.push(attendee.firstname + " " + attendee.lastname);
        //   }

        // for (const iterator of await attendanceData) {
        //   const attendee = await getUserByID(iterator.userId, {
        //     _id: 0,
        //     firstname: 1,
        //     lastname: 1,
        //   });

        //   attendees.push(attendee.firstname + " " + attendee.lastname);
        // }
        // console.log(attendees);
        const name = req.session.name;
        res
          .status(200)
          .render("workspace/attendance", { userType, name, attendanceData });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else {
      const userType = req.session.type;
      const name = req.session.name;
      res.render("workspace/attendance", { userType, name });
    }
  })
  .post(async (req, res) => {
    const moduleId = req.params.moduleId;
    const userId = req.session.userid;
    const { latitude, longitude } = req.body;

    try {
      await addStudentToAttendance(userId, moduleId, latitude, longitude);

      res.status(200).json({ message: "Attendance marked successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

router.route("/:sectionId/assignments").get(async (req, res) => {
  const section = await courseData.getSectionById(req.params.sectionId);
  res.render("workspace/assignments", {
    assignments: section.Assignments,
    sectionID: `${section.sectionId}`,
  });
});

export default router;

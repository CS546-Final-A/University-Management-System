import { Router } from "express";

const router = Router();

const dummyCourses = [
    {
        course_id: "CS 505",
        name: "Introduction to Computer Science",
        department: "Computer Science",
        level: 500,
        instructor: "John Doe",
        delivery_mode: "In-person",
        Status: "Active",
        semester: "fall-2023"
    },
    {
        course_id: "AAI 224",
        name: "Artificial Intelligence",
        department: "Artificial Intelligence",
        level: 200,
        instructor: "Jane Smith",
        delivery_mode: "Online",
        Status: "Active",
        semester: "spring-2021"
    },
    {
        course_id: "ML 400",
        name: "Machine Learning",
        department: "Machine Learning",
        level: 400,
        instructor: "David Johnson",
        delivery_mode: "In-person",
        Status: "Active",
        semester: "fall-2023"
    },
    {
        course_id: "CS 100",
        name: "Introduction to Programming",
        department: "Computer Science",
        level: 100,
        instructor: "Sarah Williams",
        delivery_mode: "Online",
        Status: "Active",
        semester: "spring-2021"
    },
    {
        course_id: "ENG 200",
        name: "English Literature",
        department: "English",
        level: 200,
        instructor: "Michael Brown",
        delivery_mode: "In-person",
        Status: "Active",
        semester: "fall-2023"
    },
    {
        course_id: "MAT 300",
        name: "Advanced Mathematics",
        department: "Mathematics",
        level: 300,
        instructor: "Emily Davis",
        delivery_mode: "Online",
        Status: "Active",
        semester: "spring-2021"
    },
    {
        course_id: "PHY 500",
        name: "Quantum Physics",
        department: "Physics",
        level: 500,
        instructor: "Robert Wilson",
        delivery_mode: "In-person",
        Status: "Active",
        semester: "fall-2023"
    },
    {
        course_id: "CHE 400",
        name: "Organic Chemistry",
        department: "Chemistry",
        level: 400,
        instructor: "Jennifer Thompson",
        delivery_mode: "Online",
        Status: "Active",
        semester: "spring-2021"
    },
    {
        course_id: "HIS 200",
        name: "World History",
        department: "History",
        level: 200,
        instructor: "Daniel Anderson",
        delivery_mode: "In-person",
        Status: "Active",
        semester: "fall-2023"
    },
    {
        course_id: "PSY 600",
        name: "Psychology",
        department: "Psychology",
        level: 600,
        instructor: "Laura Martinez",
        delivery_mode: "Online",
        Status: "Active",
        semester: "spring-2021"
    }
];

router.get("/listings", (req, res) => {
    res.render("courses/listings", { courses: dummyCourses });
});

export default router;
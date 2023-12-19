# University-Management-System

## Overview

Welcome to our final project for class CS 546! This project is designed to facilitate seamless communication and interaction among three primary roles: Admin, Professor, and Student. Below, you'll find an information on how to start and about the key features and functionalities.

## Getting Started

Create .env file
.env

```
mongoServerUrl="URL pointing to your mongodb instance"
CookieSecret="A random string that helps keep session cookies secure"
SMTPServerURL="The url pointing to your SMTP server"
SMTPPort=465
SMTPUsername="Username"
SMTPPassword="Password"
MailServerDomain="The domain from which your emails will be sent"
SiteDomain="The url from which the site can be accessed"
```

To run:

```
npm i

npm run seed

npm start
```

## Pre-Seeded User Accounts

After running the `npm run seed` command, you can use the following pre-seeded user accounts to log in to the application:

### Admin Account
- **Username:** admin@stevens.edu
- **Password:** SuperSecret

### Professor Account
- **Username:** prof1@stevens.edu
- **Password:** SuperSecret

- **Username:** prof2@stevens.edu
- **Password:** SuperSecret

### Student Account
- **Username:** student1@stevens.edu
- **Password:** SuperSecret

- **Username:** student2@stevens.edu
- **Password:** SuperSecret

- **Username:** student3@stevens.edu
- **Password:** SuperSecret

Please use these credentials to access the application with the respective roles and explore the features available for each user type.

## Features

### Admin

1. **Create User**
    - Admins have the authority to create user accounts for Professors and Students.

2. **Register, Edit Courses**
    - Admins can manage the course catalog by registering new courses and editing existing ones.


3. **Add, Delete Section to Courses**
    - Admins can organize courses by adding or deleting sections.

4. **Assign Professor to Section**
    - Admins can assign Professors to specific sections of courses.

5. **Edit Section**
    - Admins can edit the details of existing sections, such as the schedule or location.

6. **Manage Department Lookup**
    - Admins can oversee and update department-related information.

### Professor

1. **View Courses on Dashboard**
    - Professors can see the list of courses they are assigned to teach on their dashboard.

2. **Create Modules in Assigned Section**
    - Professors can create modules within the sections they are assigned to.

3. **Create Assignments**
    - Professors can create assignments for students within their assigned sections.

4. **Grade Students**
    - Professors can review and grade assignments submitted by students.

5. **Add Learning Material**
    - Professors can upload learning materials for students.

6. **Manage Attendance**
    - Professors can enable attendance and see who all are marked present based on their location.

### Student

1. **View Enrolled Courses on Dashboard**
    - Students can see a list of courses they are currently enrolled in on their dashboard.

2. **Enroll for New Courses**
    - Students can enroll in additional courses.

3. **View Course Details**
    - Students can access detailed information about each course they are enrolled in.

4. **View and Submit Assignments**
    - Students can view assignments created by professors and submit their completed work.

5. **View Grades**
    - Students can view their grades for completed assignments.

6. **Read Course Learning Materials**
    - Students can access and read learning materials uploaded by professors.

7. **Generate Transcripts**
    - Students can generate transcripts containing their academic records and grades.

8. **Mark Attendance**
    - Students can mark their attendance once the professor enables it.

## Extra Features
1. **Generate Transcripts**
2. **Integrated Frontend PDF Viewer**
3. **User Email Notifications**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

--- 

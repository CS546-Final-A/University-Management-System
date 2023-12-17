import { Router } from "express";
import { getAllDepartments } from "../../data/courses/courses.js";

const router = Router();

// Render the page with the list of departments
router.get('/', async (req, res) => {
    try {
      let renderObjs = {
        session_name: req.session.name,
        session_type: req.session.type,
        session_email: req.session.email,
        script: 'admin/configuration',
      };
      res.render('admin/configuration', renderObjs);
    } catch (error) {
      res.render('admin/config', { error: 'Error fetching departments. Please try again.' });
    }
  });
  
router.get('/departments', async (req, res) => {
    try {
      const departmentList = await getAllDepartments();
      let renderObjs = {
        session_name: req.session.name,
        session_type: req.session.type,
        session_email: req.session.email,
        departmentList,
        script: 'admin/configuration',
      };
      res.render('admin/departments', renderObjs);
    } catch (error) {
      res.render('admin/configuration', { error: 'Error fetching departments. Please try again.' });
    }
  });
  
  // Render the form for department registration
  router.get('/departments/register', (req, res) => {
    let renderObjs = {
      session_name: req.session.name,
      session_type: req.session.type,
      session_email: req.session.email,
      script: 'admin/config',
    };
    res.render('admin/registerDepartment', renderObjs);
  });
  
  
  router.post('/departments/register', async (req, res) => {
    const { departmentName } = req.body;
  
    try {
      const newDepartmentId = await registerDepartment(departmentName);
      res.redirect('/departments'); // Redirect to the departments page after successful registration
    } catch (error) {
      res.render('admin/registerDepartment', { error: 'Registration failed. Please try again.' });
    }
  });
  
  router.get('/departments/update/:id', async (req, res) => {
    const departmentId = req.params.id;
  
    try {
      const department = await getDepartmentById(departmentId);
      let renderObjs = {
        session_name: req.session.name,
        session_type: req.session.type,
        session_email: req.session.email,
        department,
        script: 'admin/config',
      };
      res.render('admin/updateDepartment', renderObjs);
    } catch (error) {
      res.render('admin/updateDepartment', { error: 'Error fetching department. Please try again.' });
    }
  });
  

  router.post('/departments/update/:id', async (req, res) => {
    const departmentId = req.params.id;
    const { departmentName } = req.body;
  
    try {
      const updatedDepartment = await updateDepartment(departmentId, departmentName);
      res.redirect('/departments');
    } catch (error) {
      res.render('admin/updateDepartment', { error: 'Update failed. Please try again.' });
    }
  });

  router.post('/departments/delete/:id', async (req, res) => {
    const departmentId = req.params.id;
  
    try {
      const deletionResult = await deleteDepartment(departmentId);
      res.redirect('/departments'); 
    } catch (error) {
      res.render('admin/config', { error: 'Deletion failed. Please try again.' });
    }
  });
  
export default router;
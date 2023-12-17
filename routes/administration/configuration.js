import { Router } from "express";
import { deleteDepartment, getAllDepartments, registerDepartment, updateDepartment } from "../../data/courses/courses.js";
import verify from "../../data_validation.js";

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
      res.render('admin/configuration', { error: 'Error fetching departments. Please try again.' });
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
        script: 'admin/departments',
      };
      res.render('admin/departments', renderObjs);
    } catch (error) {
      res.render('admin/configuration', { error: 'Error fetching departments. Please try again.' });
    }
  });
  
  
  router.post('/departments/register', async (req, res) => {
    const { departmentName } = req.body;
  
    try {
      departmentName = verify.string(departmentName, "departmentName");
      const newDepartment = await registerDepartment(departmentName);
      res.json(newDepartment);
    } catch (error) {
      res.json({error: error.message});
      // res.render('admin/departments', { error: 'Registration failed. Please try again.' });
    }
  });
  

  router.put('/departments/update/:id', async (req, res) => {
    const departmentId = req.params.id;
    const { departmentName } = req.body;
  
    try {
      verify.validateMongoId(departmentId)
      departmentName = verify.string(departmentName, "departmentName");
      const updatedDepartment = await updateDepartment(departmentId, departmentName);
      res.json(updatedDepartment);
    } catch (error) {
      res.json({error: error.message});
    }
  });

  router.post('/departments/delete/:id', async (req, res) => {
    const departmentId = req.params.id;
  
    try {
      verify.validateMongoId(departmentId)
      const deletionResult = await deleteDepartment(departmentId);
      res.redirect('/configuration/departments'); 
    } catch (error) {
      res.render('admin/configuration', { error: 'Deletion failed. Please try again.' });
    }
  });
  
export default router;
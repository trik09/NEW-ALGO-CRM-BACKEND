const express = require('express');
const projectController = require('../controllers/project.controller');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

// Route to get all projects on basis of client(qst client) ID
router.get('/getAllProjects-by-clientId/:clientId',isAuthenticated, projectController.getAllProjectsByQstClientId);

router.get('/getAllProjects', isAuthenticated, projectController.getAllProjects);


router.post('/create-project',isAuthenticated,authorizeRoles("admin","superAdmin"),projectController.createProject);
router.patch('/update-project/:id', isAuthenticated,authorizeRoles("admin","superAdmin"),projectController.updateProject);
router.delete('/delete-project/:id', isAuthenticated,authorizeRoles("admin","superAdmin"),projectController.deleteProject);

// get all projects to show on dashboard project page table
router.get('/get-all-project',isAuthenticated,projectController.getProjects);

// To add bulk projects
router.post('/bulk-add-projects', isAuthenticated,authorizeRoles("admin","superAdmin"), projectController.bulkAddProjects);

module.exports = router;








module.exports = router;
const express = require('express');
const taskController = require('../controllers/task.controller');
const { isAuthenticated ,authorizeRoles} = require('../middleware/auth.middleware');

const router = express.Router();

// Route to get all tasks
router.get('/get-all-tasks', taskController.getAllTasks);


router.put('/edit-tasks/:id', isAuthenticated, authorizeRoles("superAdmin", "admin"),taskController.updateTask);
router.delete('/delete-tasks/:id', isAuthenticated, authorizeRoles("superAdmin", "admin"),taskController.deleteTask);
router.post('/create-task', isAuthenticated, authorizeRoles("superAdmin", "admin"),taskController.createTask);

router.get("/export-tasktype-data", isAuthenticated,taskController.exportTaskTypes);

router.get('/get-all-tasks-for-rateChart', isAuthenticated,taskController.getAllTaskForCustomerRateChart);


// // Route to create a new task
// router.post('/create-task', taskController.createTask);



router.post('/createTask-bulk',isAuthenticated  ,authorizeRoles("superAdmin", "admin"),taskController.createTasksBulk);



// it will only used to dump rate chart date in db initially
// router.get("/rate-chart-db",taskController.updateDeviceRatesWithInstallationCheck);

module.exports = router;
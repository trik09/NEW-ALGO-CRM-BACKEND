const express = require('express');
const router = express.Router();
//const maindashboardcontroller = require('../controllers/maindashboard.controller');
const { isAuthenticated ,authorizeRoles} = require('../middleware/auth.middleware');


//router.get('/main-dashboard',isAuthenticated,authorizeRoles('superAdmin','admin'),maindashboardcontroller.getDashboardStats)
 

//router.get('/key-client-stats', isAuthenticated ,maindashboardcontroller.getKeyClientStats) 
//router.get('/technician-stats' ,maindashboardcontroller.getTechnicianStats) 
//router.get('/zone-stats' ,maindashboardcontroller.getVehicalsData) 
//router.get('/get-new-technician', maindashboardcontroller.getTechnicianStats1)

//router.get('/payroll-technicians-vehicle-counts', isAuthenticated, maindashboardcontroller.getPayrollTechniciansVehicleCountsForDashboard);
//router.get('/payroll-technicians-vehicle-done-tickets', maindashboardcontroller.getTicketsByTechnicianAndDateRange);


//router.get('/monthly-margins', maindashboardcontroller.getMonthlyMargins);




 


//router.get("/aggregated-details", maindashboardcontroller.getAggregatedTicketDetails);

module.exports = router;




const express = require('express');
const qstClientController = require('../controllers/qstClient.controller');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/getAllQstClient-for-tableShow', isAuthenticated, qstClientController.getAlltheQstClientForShowInTable);
router.post('/create-qstClient', isAuthenticated, authorizeRoles('superAdmin', 'admin'), qstClientController.createSingleQSTClient);

// it is used to show in dropdown of forms
router.get('/getAllQstClient', isAuthenticated, qstClientController.getAllQstClients);

router.delete('/deleteQstClient/:id', isAuthenticated, authorizeRoles('superAdmin', 'admin'), qstClientController.deleteQSTClientById); 

 router.get('/exportQstClients',isAuthenticated, qstClientController.exportQstClients);
 router.patch("/update-qstClient/:id", isAuthenticated, authorizeRoles('superAdmin', 'admin'), qstClientController.updateSingleQSTClient);


 // GET client by user ID
router.get('/get-client-by-qstuserId/:userId', isAuthenticated, qstClientController.getClientByqstUserId);



// router.get('/get-client-detail-based/:id',qstClientController.getClientDashboardStats);

module.exports = router;
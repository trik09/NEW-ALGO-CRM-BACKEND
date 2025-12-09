const express = require('express');
const ticketCloserController = require('../controllers/ticketCloser.controller');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/get-all-ticketCloser-for-table', isAuthenticated,ticketCloserController.getAllTicketClosersForTable);
router.post('/create-reason',isAuthenticated,authorizeRoles('superAdmin','admin'),ticketCloserController.createTicketClosere);
router.patch('/update-reason/:id',isAuthenticated,authorizeRoles('superAdmin','admin'),ticketCloserController.updateTicketClosere);
router.delete('/delete/:id',isAuthenticated,authorizeRoles('superAdmin','admin'),ticketCloserController.deleteTicketClosere);

router.get('/get-all-ticketCloser', isAuthenticated,ticketCloserController.getAllTicketClosers);
router.get("/export-ticketclosere", ticketCloserController.exportTicketClosers);
 
 

router.post('/bulkCreate-ticketClouserReason', isAuthenticated,ticketCloserController.createTicketClosersBulk);






module.exports = router;
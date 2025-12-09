const express = require('express');
const ticketStatus = require('../controllers/ticketStatus.controller');
const { authorizeRoles, isAuthenticated } = require('../middleware/auth.middleware');
const router = express.Router();

// router.post("/create-status",ticketStatus.createstatus);
// router.patch("update-status", ticketStatus.updatestatus);

router.post("/create-status",isAuthenticated,authorizeRoles('superAdmin','admin'),ticketStatus.createstatus);
router.patch("/update-status/:id", isAuthenticated,authorizeRoles('superAdmin','admin'), ticketStatus.updatestatus);

router.get("/get-all-status-for-tableShow", isAuthenticated, ticketStatus.getAllStatusForTableShow);
router.delete("/delete-status/:id", isAuthenticated,authorizeRoles('superAdmin','admin'), ticketStatus.deletestatus);


// it is used to fetch all ticket statuses for dropdown show in forms
router.get("/get-all-statuses", isAuthenticated, ticketStatus.getAllStatuses);




module.exports = router;


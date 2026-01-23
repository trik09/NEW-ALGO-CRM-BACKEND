const express = require('express');
const router = express.Router();

const resolutionController = require('../controllers/resolution.controller');
const { isAuthenticated,authorizeRoles } = require('../middleware/auth.middleware');



// it is  used for table data show
router.get('/get-all-resolutions-for-tableShow',isAuthenticated,resolutionController.getAllResolutionsForTableShow );

router.post('/create-resolution',isAuthenticated,authorizeRoles("superAdmin", "admin") ,resolutionController.createResolution);

// It is used for dropdown options in form elements
router.get('/get-all-resolutions',isAuthenticated,resolutionController.getAllResolutions );


router.patch('/update-resolution/:id',isAuthenticated,authorizeRoles("superAdmin", "admin") ,resolutionController.updateResolution);
router.delete('/delete/:id',isAuthenticated,authorizeRoles("superAdmin", "admin") ,resolutionController.deleteResolution);
router.get('/export-resolution',isAuthenticated,resolutionController.getAllResolutionsForExport);

// it is used for bulk creation of resolutions
router.post('/bulk-resolutionCreation', isAuthenticated, authorizeRoles("superAdmin", "admin") ,resolutionController.bulkCreateResolutions);
module.exports = router;
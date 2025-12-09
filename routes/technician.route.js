const express = require("express");
const technicianController = require("../controllers/technicianController");

const Technician = require("../models/technician.model");
const {
  isAuthenticated,
  authorizeRoles,
} = require("../middleware/auth.middleware");

const router = express.Router();

// // Get all technicians 👈 this is use IN DRODOWN OPTION in forms
router.get(
  "/get-all-technicians",
  isAuthenticated,
  technicianController.getAllTechnicians
);

router.get(
  "/get-technician/:id",
  isAuthenticated,
  technicianController.getTechnicianById
);
router.get(
  "/check-account-number-atomicity/:accountNumber",
  technicianController.checkTechnicianAccountNuberAtomicity
);
router.delete(
  "/delete-technician/:id",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin"),
  technicianController.deleteTechnician
);

// THIS DATA RENDER TECHNICIAN MIAN PAGE TO SHOW IN TABLE
router.get(
  "/get-all-technicians-withSearhFilter",
  isAuthenticated,
  technicianController.getAllTechniciansWithSearchAndFilter
);
router.get(
  "/get-all-new-view-technicians-withSearhFilter",
  isAuthenticated,
  technicianController.getAllNewViewTechniciansWithSearchAndFilter
);

router.get("/export-newTechnician-data", technicianController.ExportgetAllNewViewTechnicians)
// router.get('/get-all-active-assigned-ticket/:technicianId',technicianController.getAllActiveAssignedTicket)

// ⚠️Don't apply authentication because it is used by technician person which is not actual user(employee) of this application
router.get(
  "/get-one-active-assigned-ticket/:technicianId/:ticketId",
  technicianController.getParticularActiveAssignedTicket
);

router.patch(
  "/edit-technician/:technicianId",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin"),
  technicianController.updateTechnician
);
router.post(
  "/add-technician",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin"),
  technicianController.addSingleTechnician
);
router.post(
  "/add-technician-inTicketCreation",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin", "cse"),
  technicianController.addTechnicianDuringTicketCreation
);

router.patch(
  "/update-technician-accDetails/:technicianId",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin", "cse"),
  technicianController.updateTechnicianAccountDetails
);

// this use for save image and video url by techcina, which link get on email (don't apply authentication middleware of employee or user)
router.post(
  "/media-uploaded-to-particular-vehical",
  technicianController.savedImageToParticularVehicalByTechnician
);

router.get("/exportTechnicians", technicianController.exportsFiltTechnicians);

// Create new technician
router.post(
  "/bulk-createTechnician",
  technicianController.bulkCreateTechnicians
);

// it is used to verfy of security code of technician
router.post(
  "/securityCode/verify",
  technicianController.VerifySecurityCodeOfTechnicianInFileUpload
);

router.post('/bulk-update-categories', technicianController.bulkUpdateTechnicianCategories)

// ---------------------------------------------------
// add default value in techCategory  (temporarayly route remove later)


// router.post('/update-all-technicians-category', async (req, res) => {
//   try {
//     // Find and update all technicians where technicianCategoryType is missing, null, or empty
//     const result = await Technician.updateMany(
//       {
//         $or: [
//           { technicianCategoryType: { $exists: false } },
//           { technicianCategoryType: null },
//           { technicianCategoryType: "" },
//           { technicianCategoryType: { $regex: /^\s*$/ } } // matches empty or whitespace only
//         ]
//       },
//       { $set: { technicianCategoryType: "freelance" } }
//     );

//     // Get count of all technicians for reporting
//     const totalTechnicians = await Technician.countDocuments();

//     return res.status(200).json({
//       success: true,
//       message: `Successfully updated ${result.modifiedCount} out of ${totalTechnicians} technicians`,
//       data: {
//         totalTechnicians: totalTechnicians,
//         updatedCount: result.modifiedCount,
//         matchedCount: result.matchedCount
//       }
//     });

//   } catch (error) {
//     console.error('Error updating technician categories:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to update technician categories',
//       error: error.message
//     });
//   }
// });

// // GET API to check statistics before updating
// router.get('/technicians-category-stats', async (req, res) => {
//   try {
//     const totalTechnicians = await Technician.countDocuments();
    
//     // Count technicians that need updating
//     const techniciansNeedingUpdate = await Technician.countDocuments({
//       $or: [
//         { technicianCategoryType: { $exists: false } },
//         { technicianCategoryType: null },
//         { technicianCategoryType: "" },
//         { technicianCategoryType: { $regex: /^\s*$/ } }
//       ]
//     });

//     // Count technicians that already have a valid category
//     const techniciansWithValidCategory = totalTechnicians - techniciansNeedingUpdate;

//     return res.status(200).json({
//       success: true,
//       data: {
//         totalTechnicians,
//         techniciansNeedingUpdate,
//         techniciansWithValidCategory,
//         willBeSetTo: 'freelance'
//       }
//     });

//   } catch (error) {
//     console.error('Error getting technician category stats:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to get technician statistics',
//       error: error.message
//     });
//   }
// });


module.exports = router;

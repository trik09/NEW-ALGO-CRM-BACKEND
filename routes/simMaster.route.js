const express = require("express");
const {
  isAuthenticated,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const router = express.Router();
const simMasterController = require("../controllers/simMaster.controller");
const rdTestingController = require("../controllers/rdTesting.controller");

router.get(
  "/get-all-simMasters",
  isAuthenticated,
  simMasterController.getAllSimMasters
);
router.post(
  "/create-simMasters",
  isAuthenticated,
  simMasterController.createSimMaster
);
router.post(
  "/bulk-create-simMasters",
  isAuthenticated,
  simMasterController.bulkCreateSimMasters
);
router.put(
  "/update-simMasters/:id",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin", "cse", "store"),
  simMasterController.updateSimMaster
);
router.delete(
  "/delete-simMasters/:id",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin", "cse", "store"),
  simMasterController.deleteSimMaster
);

// R&D Testing — only r&d role
router.put(
  "/rd-testing/:id",
  isAuthenticated,
  authorizeRoles("r&d"),
  rdTestingController.rdTestSim
);

// R&D Delete image
router.delete(
  "/rd-image/:id",
  isAuthenticated,
  authorizeRoles("r&d", "superAdmin", "admin"),
  rdTestingController.rdDeleteSimImage
);

module.exports = router;



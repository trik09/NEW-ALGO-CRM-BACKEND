const express = require("express");
const {
  isAuthenticated,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const router = express.Router();
const accessoryMasterController = require("../controllers/accessoryMaster.controller");
const rdTestingController = require("../controllers/rdTesting.controller");

router.get(
  "/get-all-accessoryMaster",
  isAuthenticated,
  accessoryMasterController.getAllAccessoryMasters
);
router.post(
  "/create-accessoryMaster",
  isAuthenticated,
  accessoryMasterController.createAccessoryMasters
);
router.post(
  "/bulk-create-accessoryMaster",
  isAuthenticated,
  accessoryMasterController.bulkCreateAccessoryMasters
);
router.put(
  "/update-accessoryMaster/:id",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin", "cse", "store"),
  accessoryMasterController.updateAccessoryMasters
);
router.delete(
  "/delete-accessoryMaster/:id",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin", "cse", "store"),
  accessoryMasterController.deleteAccessoryMasters
);

// R&D Testing — only r&d role
router.put(
  "/rd-testing/:id",
  isAuthenticated,
  authorizeRoles("r&d"),
  rdTestingController.rdTestAccessory
);

// R&D Delete image
router.delete(
  "/rd-image/:id",
  isAuthenticated,
  authorizeRoles("r&d", "superAdmin", "admin"),
  rdTestingController.rdDeleteAccessoryImage
);

module.exports = router;



const express = require("express");
const {
  isAuthenticated,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const router = express.Router();
const deviceMasterController = require("../controllers/deviceMaster.controller");


router.get(
  "/get-all-deviceMasters",
  isAuthenticated,
  deviceMasterController.getAllDeviceMasters
);
router.post(
  "/create-deviceMasters",
  isAuthenticated,
  deviceMasterController.createDeviceMasters
);
router.put(
  "/update-deviceMasters/:id",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin", "cse"),
  deviceMasterController.updateDeviceMasters
);
router.delete(
  "/delete-deviceMasters/:id",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin", "cse"),
  deviceMasterController.deleteDeviceMasters
);

module.exports = router;
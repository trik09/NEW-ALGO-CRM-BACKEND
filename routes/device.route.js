const express = require("express");
const deviceController = require("../controllers/device.cntroller");
const { isAuthenticated ,authorizeRoles} = require("../middleware/auth.middleware");

const router = express.Router();

// GET all devices for dropdown in forms
router.get("/get-all-devices", deviceController.getAllDevices);

router.get("/export-device", deviceController.exportDevices);

// get all devices for table show
router.get(
  "/get-all-devices-for-tableShow",
  isAuthenticated,
  deviceController.getAllDevicesForTableShow
);

router.delete(
  "/delete/:id",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin"),
  deviceController.deleteDevice
);
router.patch(
  "/update/:id",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin"),
  deviceController.updateDevice
);
// POST routes
router.post(
  "/create-device",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin"),
  deviceController.createDevice
);

router.post(
  "/create-bulk-device",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin"),
  deviceController.createDevicesBulk
);

module.exports = router;

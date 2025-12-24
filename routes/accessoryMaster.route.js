const express = require("express");
const {
  isAuthenticated,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const router = express.Router();
const accessoryMasterController = require("../controllers/accessoryMaster.controller");

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
router.put(
  "/update-accessoryMaster/:id",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin", "cse"),
  accessoryMasterController.updateAccessoryMasters
);
router.delete(
  "/delete-accessoryMaster/:id",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin", "cse"),
  accessoryMasterController.deleteAccessoryMasters
);

module.exports = router;
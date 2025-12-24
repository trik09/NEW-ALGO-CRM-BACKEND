const express = require("express");
const {
  isAuthenticated,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const router = express.Router();
const simMasterController = require("../controllers/simMaster.controller");


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
router.put(
  "/update-simMasters/:id",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin", "cse"),
  simMasterController.updateSimMaster
);
router.delete(
  "/delete-simMasters/:id",
  isAuthenticated,
  authorizeRoles("superAdmin", "admin", "cse"),
  simMasterController.deleteSimMaster
);

module.exports = router;
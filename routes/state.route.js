
const express = require('express');
const router = express.Router();
const stateController = require('../controllers/state.controller');
const { isAuthenticated,authorizeRoles } = require('../middleware/auth.middleware');





// Bulk add states
// router.post("/bulk", stateController.addBulkStates);


// Get all states (active and inactive both)
router.get("/all-states", stateController.getAllStates);
// Get all active states
router.get("/active-states", stateController.getActiveStates);
// Update state by ID
// router.patch("/update/:id", isAuthenticated, authorizeRoles("superAdmin"), stateController.updateStateById);

// router.post("/create-states",stateController.createState);

router.patch("/update-states/:id",stateController.updateState);







module.exports = router;
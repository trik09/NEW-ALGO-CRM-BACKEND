const express = require('express');
const router = express.Router();
const swapController = require('../controllers/defectiveItemSwap.controller');

// Get available spare items for a technician
router.get('/available-spares/:technicianId', swapController.getAvailableSpareItems);

// Get pending swap requests for CSE review
router.get('/pending-requests', swapController.getPendingSwapRequests);

// Get swap history (with optional filters)
// Query params: ticketId, vehicleNumber, technicianId
router.get('/history', swapController.getSwapHistory);

// Create a swap request (technician swaps immediately)
router.post('/create', swapController.createSwapRequest);

// CSE approves swap request (defective item goes to CSE)
router.put('/approve/:swapId', swapController.approveSwapRequest);

// CSE rejects swap request (defective item stays with technician)
router.put('/reject/:swapId', swapController.rejectSwapRequest);

module.exports = router;

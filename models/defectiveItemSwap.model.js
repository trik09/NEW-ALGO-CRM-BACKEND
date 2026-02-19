const mongoose = require('mongoose');

const defectiveItemSwapSchema = new mongoose.Schema({
    // Ticket reference
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tickets',
        required: true,
        index: true
    },

    // Vehicle reference - CRITICAL: Tracks which vehicle this swap is for
    vehicleNumber: {
        type: String,
        required: true,
        index: true
    },

    // Technician who performed the swap
    technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technician',
        required: true,
        index: true
    },

    // Item type (device, sim, or accessory)
    itemType: {
        type: String,
        enum: ['device', 'sim', 'accessory'],
        required: true
    },

    // Defective item details
    defectiveItemId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'defectiveItemModel',
        required: true
    },
    defectiveItemModel: {
        type: String,
        enum: ['DeviceMaster', 'SimMaster', 'AccessoryMaster'],
        required: true
    },
    defectiveItemSerialNumber: String, // For quick reference

    // Spare item details
    spareItemId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'spareItemModel',
        required: true
    },
    spareItemModel: {
        type: String,
        enum: ['DeviceMaster', 'SimMaster', 'AccessoryMaster'],
        required: true
    },
    spareItemSerialNumber: String, // For quick reference

    // Defect details
    defectDescription: {
        type: String,
        required: true
    },
    defectImages: [String], // URLs to defect images
    swapDate: {
        type: Date,
        default: Date.now
    },

    // CSE approval workflow - CSE decides where defective item goes
    cseApprovalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true
    },
    cseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    cseApprovalDate: Date,
    cseComments: String,

    // Final status tracking
    isComplete: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for performance
defectiveItemSwapSchema.index({ ticketId: 1, vehicleNumber: 1 });
defectiveItemSwapSchema.index({ cseApprovalStatus: 1, createdAt: -1 });

module.exports = mongoose.model('DefectiveItemSwap', defectiveItemSwapSchema);

const DefectiveItemSwap = require('../models/defectiveItemSwap.model');
const DeviceMaster = require('../models/deviceMaster');
const SimMaster = require('../models/simMaster');
const AccessoryMaster = require('../models/accessoryMaster');
const Ticket = require('../models/ticket.model');
const MainData = require('../models/mainData.model');
const Employee = require('../models/employee.model');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// Helper function to upload file to S3
const uploadToS3 = async (file, folder) => {
    if (!file) return null;

    const fileExtension = file.originalname.split(".").pop();
    const timestamp = Date.now();
    const key = `${folder}/${timestamp}.${fileExtension}`;

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    const data = await s3.upload(params).promise();
    return data.Location;
};

// Helper function to get the correct model based on item type
const getItemModel = (itemType) => {
    switch (itemType) {
        case 'device':
            return DeviceMaster;
        case 'sim':
            return SimMaster;
        case 'accessory':
            return AccessoryMaster;
        default:
            throw new Error('Invalid item type');
    }
};

// Get model name for refPath
const getModelName = (itemType) => {
    switch (itemType) {
        case 'device':
            return 'DeviceMaster';
        case 'sim':
            return 'SimMaster';
        case 'accessory':
            return 'AccessoryMaster';
        default:
            throw new Error('Invalid item type');
    }
};

// 1. Get available spare items for a technician
exports.getAvailableSpareItems = async (req, res) => {
    try {
        const { technicianId } = req.params;

        // Query each master collection for items with status "with technician"
        const [devices, sims, accessories] = await Promise.all([
            DeviceMaster.find({
                status: 'with technician',
                assignedTo: technicianId,
                assignedToModel: 'Technician',
                isDefective: { $ne: true } // Exclude already defective items
            }).lean(),

            SimMaster.find({
                status: 'with technician',
                assignedTo: technicianId,
                assignedToModel: 'Technician',
                isDefective: { $ne: true }
            }).lean(),

            AccessoryMaster.find({
                status: 'with technician',
                assignedTo: technicianId,
                assignedToModel: 'Technician',
                isDefective: { $ne: true }
            }).lean()
        ]);

        return res.status(200).json({
            success: true,
            data: {
                devices,
                sims,
                accessories
            }
        });
    } catch (error) {
        console.error('Error fetching available spares:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching available spare items',
            error: error.message
        });
    }
};

// 2. Create swap request - Technician swaps immediately
exports.createSwapRequest = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            ticketId,
            vehicleNumber,
            technicianId,
            itemType,
            defectiveItemId,
            spareItemId,
            defectDescription
        } = req.body;

        // Process images if any (S3 upload remains outside the transaction but before the commit)
        let defectImages = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadToS3(file, 'defectImages'));
            defectImages = await Promise.all(uploadPromises);
        }

        // Validate required fields
        if (!ticketId || !vehicleNumber || !technicianId || !itemType ||
            !defectiveItemId || !spareItemId || !defectDescription) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Validate ticket exists and get task type
        const ticket = await Ticket.findById(ticketId).populate('taskType').session(session);
        if (!ticket) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // Check if task type is not "installation"
        const taskTypeName = ticket.taskType?.taskName || ticket.taskTypeString || '';
        if (taskTypeName.toLowerCase() === 'installation') {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({
                success: false,
                message: 'Swap feature not available for installation tasks'
            });
        }

        // Validate vehicleNumber exists in ticket
        const vehicleExists = ticket.vehicleNumbers.some(v => v.vehicleNumber === vehicleNumber);
        if (!vehicleExists) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Vehicle number not found in ticket'
            });
        }

        const ItemModel = getItemModel(itemType);
        const modelName = getModelName(itemType);

        // Validate spare item exists and is with technician
        const spareItem = await ItemModel.findOne({
            _id: spareItemId,
            status: 'with technician',
            assignedTo: technicianId
        }).session(session);

        if (!spareItem) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Spare item not found or not available'
            });
        }

        // Validate defective item exists
        const defectiveItem = await ItemModel.findById(defectiveItemId).session(session);
        if (!defectiveItem) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Defective item not found'
            });
        }

        // Get serial numbers for reference
        const spareSerial = spareItem.deviceId || spareItem.simNumber || spareItem.accessoryId || '';
        const defectiveSerial = defectiveItem.deviceId || defectiveItem.simNumber || defectiveItem.accessoryId || '';

        // Create swap record
        const swap = new DefectiveItemSwap({
            ticketId,
            vehicleNumber,
            technicianId,
            itemType,
            defectiveItemId,
            defectiveItemModel: modelName,
            defectiveItemSerialNumber: defectiveSerial,
            spareItemId,
            spareItemModel: modelName,
            spareItemSerialNumber: spareSerial,
            defectDescription,
            defectImages,
            swapDate: new Date(),
            cseApprovalStatus: 'pending'
        });

        await swap.save({ session });

        // Get customer assignment from TICKET (not defective item which might have null)
        const customerAssignment = ticket.qstClientName?._id || ticket.qstClientName;
        const customerName = ticket.qstClientName?.companyName || ticket.qstClientNameString;

        // STEP 1: Update spare item - assign to customer
        spareItem.status = 'sold to customer';
        spareItem.assignedTo = customerAssignment;
        spareItem.assignedToModel = 'QstClient';
        spareItem.assignedToName = customerName;

        if (spareItem.statusHistory) {
            spareItem.statusHistory.push({
                status: 'sold to customer',
                changedAt: new Date(),
                changedBy: `Technician ${technicianId} - Swap`
            });
        }

        await spareItem.save({ session });

        // STEP 2: Update defective item - mark as defective, assign to technician
        defectiveItem.status = 'with technician';
        defectiveItem.isDefective = true;
        defectiveItem.defectMarkedDate = new Date();
        defectiveItem.defectReason = defectDescription;
        defectiveItem.assignedTo = technicianId;
        defectiveItem.assignedToModel = 'Technician';
        defectiveItem.assignedToName = null;

        if (defectiveItem.statusHistory) {
            defectiveItem.statusHistory.push({
                status: 'with technician',
                changedAt: new Date(),
                changedBy: `Technician ${technicianId} - Defective `
            });
        }

        await defectiveItem.save({ session });

        // STEP 3: Look up directly from MainData collection by registrationNumber
        const mainDataDoc = await MainData.findOne({ registrationNumber: vehicleNumber }).session(session);

        if (!mainDataDoc) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "MainData not found for this vehicle number"
            });
        }

        const mainDataId = mainDataDoc._id;

        // STEP 4: Update MainData in DB (THE REAL SWAP)
        if (itemType === "device") {
            await MainData.updateOne(
                { _id: mainDataId },
                { $set: { deviceDetails: spareItem._id } },
                { session }
            );
        } else if (itemType === "sim") {
            await MainData.updateOne(
                { _id: mainDataId },
                { $set: { simDetails: spareItem._id } },
                { session }
            );
        } else if (itemType === "accessory") {
            // Replace in-place using positional operator (keeps same index)
            const result = await MainData.updateOne(
                { _id: mainDataId, accessoryDetails: defectiveItem._id },
                { $set: { "accessoryDetails.$": spareItem._id } },
                { session }
            );

            if (result.matchedCount === 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    success: false,
                    message: "Defective accessory not found in this vehicle's MainData"
                });
            }
        }

        // Add swap reference to ticket
        ticket.spareSwaps = ticket.spareSwaps || [];
        ticket.spareSwaps.push(swap._id);
        await ticket.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Populate the swap for response (after commit)
        const populatedSwap = await DefectiveItemSwap.findById(swap._id)
            .populate('technicianId', 'name email')
            .populate('ticketId', 'ticketSKUId')
            .populate('defectiveItemId')
            .populate('spareItemId');

        return res.status(201).json({
            success: true,
            message: 'Swap completed successfully. CSE approval pending for defective item.',
            data: populatedSwap
        });
    } catch (error) {
        // If an error occurs, abort the transaction
        await session.abortTransaction();
        session.endSession();

        console.error('Error creating swap request:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating swap request',
            error: error.message
        });
    }
};


// 3. Get pending swap requests for CSE review
exports.getPendingSwapRequests = async (req, res) => {
    try {
        const swapRequests = await DefectiveItemSwap.find({
            cseApprovalStatus: 'pending'
        })
            .populate('technicianId', 'name email mobile')
            .populate('ticketId', 'ticketSKUId qstClientNameString location')
            .populate('defectiveItemId')
            .populate('spareItemId')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: swapRequests.length,
            data: swapRequests
        });
    } catch (error) {
        console.error('Error fetching pending swap requests:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching pending swap requests',
            error: error.message
        });
    }
};

// 4. Approve swap request - CSE approves defect claim
exports.approveSwapRequest = async (req, res) => {
    try {
        const { swapId } = req.params;
        const { cseId, cseComments } = req.body;

        const swap = await DefectiveItemSwap.findById(swapId);
        if (!swap) {
            return res.status(404).json({
                success: false,
                message: 'Swap request not found'
            });
        }

        if (swap.cseApprovalStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Swap request already processed'
            });
        }

        const ItemModel = getItemModel(swap.itemType);

        // Update defective item
        const defectiveItem = await ItemModel.findById(swap.defectiveItemId);
        if (!defectiveItem) {
            return res.status(404).json({
                success: false,
                message: 'Defective item not found'
            });
        }

        defectiveItem.status = 'with cse';
        defectiveItem.isDefective = true;
        defectiveItem.defectMarkedDate = new Date();
        defectiveItem.defectReason = swap.defectDescription;
        defectiveItem.assignedTo = cseId;
        defectiveItem.assignedToModel = 'Employee';

        const cse = await Employee.findById(cseId);
        const cseName = cse ? cse.name : 'Unknown CSE';

        if ('assignedToName' in defectiveItem || defectiveItem.assignedToName !== undefined) {
            defectiveItem.assignedToName = cseName;
        }

        // Add to status history
        if (defectiveItem.statusHistory) {
            defectiveItem.statusHistory.push({
                status: 'with cse',
                changedAt: new Date(),
                changedBy: `CSE ${cseName} - Defect Approved`
            });
        }

        await defectiveItem.save();

        // Update swap record
        swap.cseApprovalStatus = 'approved';
        swap.cseId = cseId;
        swap.cseApprovalDate = new Date();
        swap.cseComments = cseComments || '';
        swap.isComplete = true;

        await swap.save();

        const populatedSwap = await DefectiveItemSwap.findById(swapId)
            .populate('technicianId', 'name email')
            .populate('ticketId', 'ticketSKUId')
            .populate('cseId', 'name')
            .populate('defectiveItemId')
            .populate('spareItemId');

        return res.status(200).json({
            success: true,
            message: 'Swap request approved. Defective item sent to CSE.',
            data: populatedSwap
        });
    } catch (error) {
        console.error('Error approving swap request:', error);
        return res.status(500).json({
            success: false,
            message: 'Error approving swap request',
            error: error.message
        });
    }
};

// 5. Reject swap request - CSE rejects defect claim
exports.rejectSwapRequest = async (req, res) => {
    try {
        const { swapId } = req.params;
        const { cseId, cseComments } = req.body;

        const swap = await DefectiveItemSwap.findById(swapId);
        if (!swap) {
            return res.status(404).json({
                success: false,
                message: 'Swap request not found'
            });
        }

        if (swap.cseApprovalStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Swap request already processed'
            });
        }

        const ItemModel = getItemModel(swap.itemType);

        // Update defective item - stays with technician
        const defectiveItem = await ItemModel.findById(swap.defectiveItemId);
        if (!defectiveItem) {
            return res.status(404).json({
                success: false,
                message: 'Defective item not found'
            });
        }

        defectiveItem.status = 'with technician';
        defectiveItem.isDefective = true; // Still marked as defective
        defectiveItem.defectMarkedDate = new Date();
        defectiveItem.defectReason = swap.defectDescription;
        defectiveItem.assignedTo = swap.technicianId;
        defectiveItem.assignedToModel = 'Technician';

        // Add to status history
        if (defectiveItem.statusHistory) {
            defectiveItem.statusHistory.push({
                status: 'with technician',
                changedAt: new Date(),
                changedBy: `CSE ${cseId} - Defect Rejected`
            });
        }

        await defectiveItem.save();

        // Update swap record
        swap.cseApprovalStatus = 'rejected';
        swap.cseId = cseId;
        swap.cseApprovalDate = new Date();
        swap.cseComments = cseComments || '';
        swap.isComplete = true;

        await swap.save();

        const populatedSwap = await DefectiveItemSwap.findById(swapId)
            .populate('technicianId', 'name email')
            .populate('ticketId', 'ticketSKUId')
            .populate('cseId', 'name')
            .populate('defectiveItemId')
            .populate('spareItemId');

        return res.status(200).json({
            success: true,
            message: 'Swap request rejected. Defective item remains with technician.',
            data: populatedSwap
        });
    } catch (error) {
        console.error('Error rejecting swap request:', error);
        return res.status(500).json({
            success: false,
            message: 'Error rejecting swap request',
            error: error.message
        });
    }
};

// 6. Get swap history (grouped by vehicle if ticketId provided)
exports.getSwapHistory = async (req, res) => {
    try {
        const { ticketId, vehicleNumber, technicianId } = req.query;

        let filter = {};

        if (ticketId) filter.ticketId = ticketId;
        if (vehicleNumber) filter.vehicleNumber = vehicleNumber;
        if (technicianId) filter.technicianId = technicianId;

        const swaps = await DefectiveItemSwap.find(filter)
            .populate('technicianId', 'name email mobile')
            .populate('ticketId', 'ticketSKUId qstClientNameString location softCloseByTechnician softCloseByTechnicianComment')
            .populate('cseId', 'name')
            .populate('defectiveItemId')
            .populate('spareItemId')
            .sort({ createdAt: -1 });

        // Group by vehicle if ticketId is provided
        let groupedData = swaps;
        if (ticketId && !vehicleNumber) {
            groupedData = swaps.reduce((acc, swap) => {
                const vehicle = swap.vehicleNumber;
                if (!acc[vehicle]) {
                    acc[vehicle] = [];
                }
                acc[vehicle].push(swap);
                return acc;
            }, {});
        }

        return res.status(200).json({
            success: true,
            count: swaps.length,
            data: groupedData
        });
    } catch (error) {
        console.error('Error fetching swap history:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching swap history',
            error: error.message
        });
    }
};

// 7. Get which ticket IDs (from a given list) have at least one swap
exports.getTicketsWithSwaps = async (req, res) => {
    try {
        const { ticketIds } = req.query;
        if (!ticketIds) {
            return res.status(400).json({ success: false, message: 'ticketIds query param required' });
        }

        const ids = ticketIds.split(',').filter(id => mongoose.Types.ObjectId.isValid(id));
        if (ids.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        // Distinct ticketIds that have at least one swap record
        const swappedIds = await DefectiveItemSwap.distinct('ticketId', {
            ticketId: { $in: ids }
        });

        return res.status(200).json({
            success: true,
            data: swappedIds.map(id => id.toString())
        });
    } catch (error) {
        console.error('Error fetching tickets with swaps:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching tickets with swaps',
            error: error.message
        });
    }
};

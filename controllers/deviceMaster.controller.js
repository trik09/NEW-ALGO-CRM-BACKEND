const DeviceMasterModel = require("../models/deviceMaster");
const mongoose = require("mongoose");

exports.getAllDeviceMasters = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        
        const { search, sortBy, sortOrder } = req.query;
        const toatlCount = await DeviceMasterModel.countDocuments();

        let searchQuery = {};
        if (search) {
            searchQuery = {
                $or: [
                    { deviceManufacturer: { $regex: search, $options: 'i' } },
                    { deviceType: { $regex: search, $options: 'i' } },
                    { deviceModel: { $regex: search, $options: 'i' } },
                    { deviceId: { $regex: search, $options: 'i' } },
                    { invoiceNumber: { $regex: search, $options: 'i' } },
                    { customerName: { $regex: search, $options: 'i' } },
                    {status: { $regex: search, $options: 'i' } },
                ],
            };
        }
        const deviceMasters = await DeviceMasterModel
        .find(searchQuery)
        .skip(skip)
        .limit(limit)
        .sort({ [sortBy]: sortOrder });


        const totalPages = Math.ceil(toatlCount / limit);
       
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;
        res.status(200).json({
            success: true,
            deviceMasters,
            totalPages,
            hasNextPage,
            hasPreviousPage,
            nextPage: hasNextPage ? page + 1 : null,
            previousPage: hasPreviousPage ? page - 1 : null,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.createDeviceMasters = async (req, res) => {
    try {
        const { deviceManufacturer, deviceType, deviceModel, deviceId, invoiceDate, invoiceNumber, warrantyPeriod,deviceAge,warrantyStatus,status,customerName } = req.body;


        const newDeviceMaster = new DeviceMasterModel({
            deviceManufacturer,
            deviceType,
            deviceModel,
            deviceId,
            invoiceDate,
            invoiceNumber,
            warrantyPeriod,
            deviceAge,
            warrantyStatus,
            status,
            customerName,
        });

        await newDeviceMaster.save();

        res.status(201).json({
            success: true,
            message: "Device Master created successfully",
            deviceMaster: newDeviceMaster,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.updateDeviceMasters = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid device master ID",
            });
        }

        const updates = Object.fromEntries(
            Object.entries(req.body).filter(([_, value]) => value !== undefined)
        );

        const updatedDeviceMaster = await DeviceMasterModel.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedDeviceMaster) {
            return res.status(404).json({
                success: false,
                message: "Device Master not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Device Master updated successfully",
            deviceMaster: updatedDeviceMaster,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteDeviceMasters = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid device master ID",
            });
        }

        const deletedDeviceMaster = await DeviceMasterModel.findByIdAndDelete(id);
        if (!deletedDeviceMaster) {
            return res.status(404).json({
                success: false,
                message: "Device Master not found",
            });
        }
        res.status(200).json({
            success: true,
            message: "Device Master deleted successfully",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


const accessoryMasterModel = require('../models/accessoryMaster');
const mongoose = require("mongoose");


exports.getAllAccessoryMasters = async (req, res) => {
    try {
        const accessoryMasters = await accessoryMasterModel.find();

        res.status(200).json({
            success: true,
            accessoryMasters,
        });

    }catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.createAccessoryMasters = async (req, res) => {
    try {
        const {accessoryManufacturer, accessoryType, accessoryModel, accessoryId, invoiceDate, invoiceNumber, warrantyPeriod,} = req.body;

        console.log("Incoming data:", req.body);

        if (!accessoryManufacturer || !accessoryType || !accessoryModel || !accessoryId || !invoiceDate || !invoiceNumber || warrantyPeriod === undefined || warrantyPeriod === null) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const accessoryMaster = await accessoryMasterModel.create({
            accessoryManufacturer,
            accessoryType,
            accessoryModel,
            accessoryId,
            invoiceDate,
            invoiceNumber,
            warrantyPeriod,
        });

        await accessoryMaster.save();

        res.status(201).json({
            success: true,
            message: "Accessory Master created successfully",
            accessoryMaster,
        });

    }catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

exports.updateAccessoryMasters = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid accessory master ID",
            });
        }

        const updates = Object.fromEntries(
            Object.entries(req.body).filter(([_, value]) => value !== undefined)
        );

        const updatedAccessoryMaster = await accessoryMasterModel.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );

        if (!updatedAccessoryMaster) {
            return res.status(404).json({
                success: false,
                message: "Accessory Master not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Accessory Master updated successfully",
            accessoryMaster: updatedAccessoryMaster,
        });

    }catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
exports.deleteAccessoryMasters = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid accessory master ID",
            });
        }

        const deletedAccessoryMaster = await accessoryMasterModel.findByIdAndDelete(id);

        if (!deletedAccessoryMaster) {
            return res.status(404).json({
                success: false,
                message: "Accessory Master not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Accessory Master deleted successfully",
        });

    }catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}
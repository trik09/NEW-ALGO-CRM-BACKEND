const DeviceMasterModel = require("../models/deviceMaster");

exports.getAllDeviceMasters = async (req, res) => {
    try {
        const deviceMasters = await DeviceMasterModel.find();
        res.status(200).json({
            success: true,
            deviceMasters,
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
        const { deviceManufacturer, deviceType, deviceModel, invoiceDate, invoiceNumber, warrantyPeriod, } = req.body;

        if (!deviceManufacturer || !deviceType || !deviceModel || !invoiceDate || !invoiceNumber || warrantyPeriod === undefined || warrantyPeriod === null) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const newDeviceMaster = new DeviceMasterModel({
            deviceManufacturer,
            deviceType,
            deviceModel,
            invoiceDate,
            invoiceNumber,
            warrantyPeriod,
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


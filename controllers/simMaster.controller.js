const simMasterModel = require('../models/simMaster');

exports.getAllSimMasters = async (req, res) => {
    try{
        const simMasters = await simMasterModel.find();
        res.status(200).json({
            success: true,
            simMasters,
        });

    }catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.createSimMaster = async (req, res) => {
    try{
        const { simOwner, simProvider, simNumber, purchaseDate, monthlyRental, monthlyBillingDate } = req.body;

        if (!simOwner || !simProvider || !simNumber || !purchaseDate || !monthlyRental || !monthlyBillingDate) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const newSimMaster = new simMasterModel({
            simOwner,
            simProvider,
            simNumber,
            purchaseDate,
            monthlyRental,
            monthlyBillingDate,
        });

        await newSimMaster.save();

        res.status(201).json({
            success: true,
            message: "Sim Master created successfully",
            simMaster: newSimMaster,
        });

    }catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.updateSimMaster = async (req, res) => {
    try{
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sim master ID",
            });
        }

        const updates = Object.fromEntries(
            Object.entries(req.body).filter(([_, value]) => value !== undefined)
        );

        const updatedSimMaster = await simMasterModel.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!updatedSimMaster) {
            return res.status(404).json({
                success: false,
                message: "Sim Master not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Sim Master updated successfully",
            simMaster: updatedSimMaster,
        });

    }catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.deleteSimMaster = async (req, res) => {
    try{
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sim master ID",
            });
        }

        const deletedSimMaster = await simMasterModel.findByIdAndDelete(id);

        if (!deletedSimMaster) {
            return res.status(404).json({
                success: false,
                message: "Sim Master not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Sim Master deleted successfully",
        });

    }catch(error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}
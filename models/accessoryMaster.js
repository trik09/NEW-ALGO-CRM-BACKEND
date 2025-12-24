const mongoose = require('mongoose');

const accessoryMasterSchema = new mongoose.Schema({
    accessoryManufacturer: {
        type: String,
        required: true,
    },
    accessoryType: {
        type: String,
        required: true,
    },
    accessoryModel: {
        type: String,
        required: true,
    },
    accessoryId: {
        type: String,
        required: true,
    },
    invoiceDate: {
        type: String,
        required: true,
    },
    invoiceNumber: {
        type: String,
        required: true,
    },
    warrantyPeriod: {
        type: Number, // in months
        required: true
    }
}, {timestamps: true});

const AccessoryMaster = mongoose.model('AccessoryMaster', accessoryMasterSchema);
module.exports = AccessoryMaster;
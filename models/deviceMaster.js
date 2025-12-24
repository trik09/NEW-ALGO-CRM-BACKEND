const mongoose = require('mongoose');

const deviceMasterSchema = new mongoose.Schema({
    deviceManufacturer: {
        type: String,
        required: true,
    },
    deviceType: {
        type: String,
        required: true,
    },
    deviceModel: {
        type: String,
        required: true,
    },
    invoiceNumber: {
        type: String,
        required: true,
    },
    invoiceDate: {
        type: Date,
        required: true,
    },
    warrantyPeriod: {
        type: Number, // in months
        required: true
    }

}, { timestamps: true });

const DeviceMaster = mongoose.model('DeviceMaster', deviceMasterSchema);
module.exports = DeviceMaster;
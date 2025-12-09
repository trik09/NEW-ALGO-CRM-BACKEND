const mongoose = require('mongoose');

const existingCustomerSchema = new mongoose.Schema({
    companyName: {
        type: String,
        default: ''
    },
    registrationNumber: {
        type: String,
        default: ''
    },
    deviceId: {
        type: String,
        default: ''
    },
    deviceManufacturer: {
        type: String,
        default: ''
    },
    deviceType: {
        type: String,
        default: ''
    },
    deviceModel: {
        type: String,
        default: ''
    },
    referType: {
        type: String,
        default: 'no',
    },
    assetType: {
        type: String,
        default: '',
    },
    mobileNumber: {
        type: String,
        default: ''
    },
    simOnwer: {
        type: String,
        default: ''
    },
    simProvider: {
        type: String,
        default: ''
    },
    server: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const existingCustomerModel = mongoose.model('ExistingCustomer', existingCustomerSchema);

module.exports = existingCustomerModel;

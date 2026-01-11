const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: [
            'stock',
            'sold to customer',
            'customer demo',
            'testing',
            'with technician',
            'with cse'
        ],
    },
    changedAt: {
        type: Date,
        default: Date.now
    },
    changedBy: {
        type: String 
    }
}, { _id: false });

const deviceMasterSchema = new mongoose.Schema({
    deviceManufacturer: {
        type: String,
    },
    deviceType: {
        type: String,
    },
    deviceModel: {
        type: String,
    },
    deviceId: {
        type: String,
    },
    invoiceDate: {
        type: Date,
    },
    invoiceNumber: {
        type: String,
    },
    deviceAge: {
        type: String,
    },
    warrantyPeriod: {
        type: Number,
    },
    warrantyStatus: {
        type: String,
        enum: ['active', 'out of warranty']
    },
    status: {
        type: String,
        enum: [
            'stock',
            'sold to customer',
            'customer demo',
            'testing',
            'with technician',
            'with cse'
        ],
        default: 'stock'
    },
    customerName:{
        type:String
    },

    statusHistory: [statusHistorySchema]

}, { timestamps: true });

const DeviceMaster = mongoose.model('DeviceMaster', deviceMasterSchema);
module.exports = DeviceMaster;
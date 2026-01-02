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

const simMasterSchema = new mongoose.Schema({
    simOwner: {
        type: String,
    },
    simProvider: {
        type: String,
    },
    simType: {
        type: String,
    },
    simNumber: {
        type: String,
    },
    mobileNumber: {
        type: String,
    },
    purchaseDate: {
        type: Date,
    },
    isSimActivated: {
        type: Boolean,
        default: false
    },
    activationDate: {
        type: String,
    },
    monthlyRental: {
        type: String,
    }, 
    monthlyData: {
        type: String,
    },
    simAge: {
        type: String,
    },
    customerOrAlgoEmployeeName: {
        type: String,
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

    statusHistory: [statusHistorySchema]

}, { timestamps: true});

const simMaster = mongoose.model('SimMaster', simMasterSchema);
module.exports = simMaster;
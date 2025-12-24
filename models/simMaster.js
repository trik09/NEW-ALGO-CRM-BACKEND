const mongoose = require('mongoose');

const simMasterSchema = new mongoose.Schema({
    simOwner: {
        type: String,
        required: true,
    },
    simProvider: {
        type: String,
        required: true,
    },
    simNumber: {
        type: String,
        required: true,
    },
    purchaseDate: {
        type: Date,
        required: true,
    },
    monthlyRental: {
        type: String,
        required: true,
    }, 
    monthlyBillingDate: {
        type: String,
        required: true,
    }
}, { timestamps: true});

const simMaster = mongoose.model('SimMaster', simMasterSchema);
module.exports = simMaster;
const mongoose = require('mongoose');

const EODCustomersSchema = new mongoose.Schema({
    customerName: {
        type: String,
    },
    dateOfVisit: {
        type: String,
    },
    month: {
        type: String,
    },
    state: {
        type: String,
    },
    city: {
        type: String,
    }, 
    callType: {
        type: String,
    },
    deviceType: {
        type: String,
    },
    deviceManufacturer:{
        type:String,
    },
    deviceModel:{
        type:String,
    },
    oldVehicleNumber:{
        type:String,
    },
    newVehicleNumber:{
        type:String,
    },
    oldIMEINumber:{
        type:String,
    },
    newIMEINumber:{
        type:String,
    },
    oldSIMNumber:{
        type:String,
    },
    newSIMNumber:{
        type:String,
    },
    technicianName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technician',
        required: true
    }, 
    additionalTechnicianName: {
        type: String,
    },
    cseName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    issueFound: {
        type: String,
    },
    resolutionDone: {
        type: String,
    },
    remarks: {
        type: String,
    },
    completionStatus: {
        type: String,
        enum: ['yes', 'no']
    },


},
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('EODCustomers', EODCustomersSchema);
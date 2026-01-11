const mongoose = require("mongoose");

const mainDataSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QstClient",
        required: true
    },
    registrationNumber: {
        type: String,
    },
    referType: {
        type: String,
    },
    assetType: {
        type: String,
    },
    server: {
        type: String,
    },
    simDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SimMaster"
    },
    deviceDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DeviceMaster"
    },


}, { timestamps: true });

const MainData = mongoose.model("MainData", mainDataSchema);

module.exports = MainData;
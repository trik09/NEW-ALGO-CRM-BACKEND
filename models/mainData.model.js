const mongoose = require("mongoose");

const mainDataSchema = new mongoose.Schema({
    companyName: {
        type: String,
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
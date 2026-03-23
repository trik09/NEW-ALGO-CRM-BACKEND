require('dotenv').config();
const mongoose = require('mongoose');

async function checkDevice() {
    await mongoose.connect(process.env.MONGODB_URI);

    // Check device
    const DeviceMaster = require('./models/deviceMaster.js');
    const device = await DeviceMaster.findOne({ deviceId: '202027164' });
    console.log("DEVICE:", JSON.stringify(device, null, 2));

    if (device) {
        const MainData = require('./models/mainData.model.js');
        const mainData = await MainData.findOne({ deviceDetails: device._id });
        console.log("\nMAINDATA USING THIS DEVICE:", mainData ? JSON.stringify(mainData, null, 2) : "None");

        const DefectiveItemSwap = require('./models/defectiveItemSwap.model.js');
        const swap = await DefectiveItemSwap.findOne({ defectiveItemId: device._id });
        console.log("\nSWAP REQUEST FOR THIS DEVICE:", swap ? JSON.stringify(swap, null, 2) : "None");
    }

    process.exit(0);
}

checkDevice();

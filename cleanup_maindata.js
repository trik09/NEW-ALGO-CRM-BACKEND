require('dotenv').config();
const mongoose = require('mongoose');

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const MainData = require('./models/mainData.model.js');
        const DeviceMaster = require('./models/deviceMaster.js');
        const SimMaster = require('./models/simMaster.js');
        const AccessoryMaster = require('./models/accessoryMaster.js');

        const invalidStatuses = ["testing", "defective", "stock"];

        // 1. Devices
        const invalidDevices = await DeviceMaster.find({ status: { $in: invalidStatuses } }, '_id');
        const invalidDeviceIds = invalidDevices.map(d => d._id);

        let deviceRes = await MainData.updateMany(
            { deviceDetails: { $in: invalidDeviceIds } },
            { $unset: { deviceDetails: 1 } }
        );
        console.log(`Cleaned up ${deviceRes.modifiedCount} MainData docs with invalid deviceDetails.`);

        // 2. SIMs
        const invalidSims = await SimMaster.find({ status: { $in: invalidStatuses } }, '_id');
        const invalidSimIds = invalidSims.map(s => s._id);

        let simRes = await MainData.updateMany(
            { simDetails: { $in: invalidSimIds } },
            { $unset: { simDetails: 1 } }
        );
        console.log(`Cleaned up ${simRes.modifiedCount} MainData docs with invalid simDetails.`);

        // 3. Accessories
        const invalidAccessories = await AccessoryMaster.find({ status: { $in: invalidStatuses } }, '_id');
        const invalidAccessoryIds = invalidAccessories.map(a => a._id);

        // We use $pullAll since it's an array of IDs
        let accRes = await MainData.updateMany(
            { accessoryDetails: { $in: invalidAccessoryIds } },
            { $pullAll: { accessoryDetails: invalidAccessoryIds } }
        );
        console.log(`Cleaned up ${accRes.modifiedCount} MainData docs with invalid accessoryDetails.`);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

cleanup();

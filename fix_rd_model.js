require('dotenv').config();
const mongoose = require('mongoose');

async function fixModels() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for fixing 'r&d'.");

        const DeviceMaster = require('./models/deviceMaster.js');
        const SimMaster = require('./models/simMaster.js');
        const AccessoryMaster = require('./models/accessoryMaster.js');

        const deviceRes = await DeviceMaster.updateMany(
            { assignedToModel: 'r&d' },
            { $set: { assignedToModel: 'Employee' } }
        );
        console.log(`Fixed ${deviceRes.modifiedCount} devices.`);

        const simRes = await SimMaster.updateMany(
            { assignedToModel: 'r&d' },
            { $set: { assignedToModel: 'Employee' } }
        );
        console.log(`Fixed ${simRes.modifiedCount} SIMs.`);

        const accRes = await AccessoryMaster.updateMany(
            { assignedToModel: 'r&d' },
            { $set: { assignedToModel: 'Employee' } }
        );
        console.log(`Fixed ${accRes.modifiedCount} accessories.`);

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

fixModels();

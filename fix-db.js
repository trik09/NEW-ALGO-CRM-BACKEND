const mongoose = require('mongoose');
require('dotenv').config();

const DeviceMaster = require('./models/deviceMaster');
const SimMaster = require('./models/simMaster');
const AccessoryMaster = require('./models/accessoryMaster');

async function fixDB() {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/algocrm";
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to DB');

        const dRes = await DeviceMaster.updateMany(
            { assignedToModel: 'r&d' },
            { $set: { assignedToModel: 'Employee' } }
        );
        console.log('DeviceMaster updated:', dRes.modifiedCount);

        const sRes = await SimMaster.updateMany(
            { assignedToModel: 'r&d' },
            { $set: { assignedToModel: 'Employee' } }
        );
        console.log('SimMaster updated:', sRes.modifiedCount);

        const aRes = await AccessoryMaster.updateMany(
            { assignedToModel: 'r&d' },
            { $set: { assignedToModel: 'Employee' } }
        );
        console.log('AccessoryMaster updated:', aRes.modifiedCount);

        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fixDB();

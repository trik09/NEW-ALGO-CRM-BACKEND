require("dotenv").config();
const mongoose = require("mongoose");

const OldData = require('../models/existingCustomer'); // your existing collection
const MainData = require("../models/mainData.model");
const SimMaster = require("../models/simMaster");
const DeviceMaster = require("../models/deviceMaster");

async function migrate() {
  try {
    await mongoose.connect('mongodb+srv://Zod:Zaaves7560@cluster1.feijb.mongodb.net/AlgoMatrixCRM');
    console.log("MongoDB connected");

    const cursor = OldData.find().cursor(); // STREAMING (safe for 19k+)

    console.log("Starting migration with data...", cursor);

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {

      /* 1️⃣ Create SIM */
      const sim = await SimMaster.create({
        simOwner: doc.simOwner,
        simProvider: doc.simProvider,
        simType: doc.simType,
        simNumber: doc.simNumber,
        mobileNumber: doc.mobileNumber,
        purchaseDate: doc.purchaseDate || null,
        status: 'stock'
      });

      /* 2️⃣ Create DEVICE */
      const device = await DeviceMaster.create({
        deviceManufacturer: doc.deviceManufacturer,
        deviceType: doc.deviceType,
        deviceModel: doc.deviceModel,
        deviceId: doc.deviceId,
        invoiceDate: doc.invoiceDate || null,
        status: 'stock'
      });

      /* 3️⃣ Create MAIN DATA */
      await MainData.create({
        companyName: doc.companyName,
        registrationNumber: doc.registrationNumber,
        referType: doc.referType,
        assetType: doc.assetType,
        server: doc.server,
        simDetails: sim._id,
        deviceDetails: device._id
      });
    }

    console.log("✅ Migration completed successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();

// require("dotenv").config();
// const mongoose = require("mongoose");

// const OldData = require('../models/existingCustomer'); // your existing collection
// const MainData = require("../models/mainData.model");
// const SimMaster = require("../models/simMaster");
// const DeviceMaster = require("../models/deviceMaster");
// const QstClient = require("../models/qstClient.model");

// async function migrate() {
//   try {
//     await mongoose.connect('mongodb+srv://riyazrahman_db_user:3qey9dM0Zui7GgVt@cluster0.wsbhkym.mongodb.net/AlgoMatrixCRM');
//     // await mongoose.connect('mongodb+srv://Zod:Zaaves7560@cluster1.feijb.mongodb.net/AlgoMatrixCRM');
//     console.log("MongoDB connected");

//     const cursor = OldData.find().cursor(); // STREAMING (safe for 19k+)

//     console.log("Starting migration with data...", cursor);

//     for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {


//       if (!doc.companyName) continue; // safety

//       /* ✅ CHECK IF COMPANY EXISTS */
//       const existingCompany = await QstClient.findOne({
//         companyName: doc.companyName
//       });

//       /* ✅ CREATE ONLY IF NOT EXISTS */
//       if (!existingCompany) {
//         await QstClient.create({
//           companyName: doc.companyName,
//           companyShortName: doc.companyName
//             .split(" ")
//             .map(w => w[0])
//             .join("")
//             .toUpperCase(),
//         });

//         console.log("Created:", doc.companyName);
//       }
//     }

//     console.log("✅ Migration completed successfully");
//     process.exit();
//   } catch (err) {
//     console.error("❌ Migration failed:", err);
//     process.exit(1);
//   }
// }

// migrate();


// first run above script into client's db then below script

require("dotenv").config();
const mongoose = require("mongoose");

const OldData = require("../models/existingCustomer");
const MainData = require("../models/mainData.model");
const SimMaster = require("../models/simMaster");
const DeviceMaster = require("../models/deviceMaster");
const QstClient = require("../models/qstClient.model");

async function migrate() {
  try {
    // await mongoose.connect('mongodb+srv://Zod:Zaaves7560@cluster1.feijb.mongodb.net/AlgoMatrixCRM');
    await mongoose.connect('mongodb+srv://riyazrahman_db_user:3qey9dM0Zui7GgVt@cluster0.wsbhkym.mongodb.net/AlgoMatrixCRM');
    console.log("MongoDB connected");

    // 1️⃣ Load all QstClients into memory once
    const clients = await QstClient.find({}, { _id: 1, companyName: 1 }).lean();
    const clientMap = new Map(clients.map(c => [c.companyName, c._id]));

    // 2️⃣ Fetch all old data into memory (24k docs ~ 15MB RAM, takes <1 sec)
    const oldDocs = await OldData.find().lean();
    console.log(`Fetched ${oldDocs.length} records. Starting batch migration...`);

    const BATCH_SIZE = 100;
    let count = 0;

    for (let i = 0; i < oldDocs.length; i += BATCH_SIZE) {
      const batch = oldDocs.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (doc) => {
          if (!doc.companyName) return;

          const companyId = clientMap.get(doc.companyName);
          if (!companyId) {
            console.warn("Company not found:", doc.companyName);
            return;
          }

          /* CREATE SIM */
          const sim = await SimMaster.create({
            simOwner: doc.simOwner,
            simProvider: doc.simProvider,
            simType: doc.simType,
            simNumber: doc.simNumber,
            mobileNumber: doc.mobileNumber,
            purchaseDate: doc.purchaseDate || null,
            status: "stock"
          });

          /* CREATE DEVICE */
          const device = await DeviceMaster.create({
            deviceManufacturer: doc.deviceManufacturer,
            deviceType: doc.deviceType,
            deviceModel: doc.deviceModel,
            deviceId: doc.deviceId,
            invoiceDate: doc.invoiceDate || null,
            status: "stock"
          });

          /* CREATE MAIN DATA */
          await MainData.create({
            company: companyId,
            registrationNumber: doc.registrationNumber,
            referType: doc.referType,
            assetType: doc.assetType,
            server: doc.server,
            simDetails: sim._id,
            deviceDetails: device._id
          });

          count++;
        })
      );

      console.log(`Processed ${Math.min(i + BATCH_SIZE, oldDocs.length)} / ${oldDocs.length} records...`);
    }

    console.log(`✅ MainData + Sim + Device migration completed successfully. Total: ${count}`);
    process.exit();
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();

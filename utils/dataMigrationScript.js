// require("dotenv").config();
// const mongoose = require("mongoose");

// const OldData = require('../models/existingCustomer'); // your existing collection
// const MainData = require("../models/mainData.model");
// const SimMaster = require("../models/simMaster");
// const DeviceMaster = require("../models/deviceMaster");
// const QstClient = require("../models/qstClient.model");

// async function migrate() {
//   try {
//     await mongoose.connect('mongodb+srv://Zod:Zaaves7560@cluster1.feijb.mongodb.net/AlgoMatrixCRM');
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


//     /* 1️⃣ Create SIM */
//     // const sim = await SimMaster.create({
//     //   simOwner: doc.simOwner,
//     //   simProvider: doc.simProvider,
//     //   simType: doc.simType,
//     //   simNumber: doc.simNumber,
//     //   mobileNumber: doc.mobileNumber,
//     //   purchaseDate: doc.purchaseDate || null,
//     //   status: 'stock'
//     // });

//     /* 2️⃣ Create DEVICE */
//     // const device = await DeviceMaster.create({
//     //   deviceManufacturer: doc.deviceManufacturer,
//     //   deviceType: doc.deviceType,
//     //   deviceModel: doc.deviceModel,
//     //   deviceId: doc.deviceId,
//     //   invoiceDate: doc.invoiceDate || null,
//     //   status: 'stock'
//     // });

//     /* 3️⃣ Create MAIN DATA */
//     //   await MainData.create({
//     //     company: company._id,
//     //     registrationNumber: doc.registrationNumber,
//     //     referType: doc.referType,
//     //     assetType: doc.assetType,
//     //     server: doc.server,
//     //     simDetails: sim._id,
//     //     deviceDetails: device._id
//     //   });
//     // }

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
    await mongoose.connect('mongodb+srv://Zod:Zaaves7560@cluster1.feijb.mongodb.net/AlgoMatrixCRM');
    console.log("MongoDB connected");

    const cursor = OldData.find().cursor();

    for (
      let doc = await cursor.next();
      doc != null;
      doc = await cursor.next()
    ) {

      if (!doc.companyName) continue;

      /* 1️⃣ FIND EXISTING COMPANY */
      const company = await QstClient.findOne({
        companyName: doc.companyName
      });

      // Safety: skip if company somehow missing
      if (!company) {
        console.warn("Company not found:", doc.companyName);
        continue;
      }

      /* 2️⃣ CREATE SIM */
      const sim = await SimMaster.create({
        simOwner: doc.simOwner,
        simProvider: doc.simProvider,
        simType: doc.simType,
        simNumber: doc.simNumber,
        mobileNumber: doc.mobileNumber,
        purchaseDate: doc.purchaseDate || null,
        status: "stock"
      });

      /* 3️⃣ CREATE DEVICE */
      const device = await DeviceMaster.create({
        deviceManufacturer: doc.deviceManufacturer,
        deviceType: doc.deviceType,
        deviceModel: doc.deviceModel,
        deviceId: doc.deviceId,
        invoiceDate: doc.invoiceDate || null,
        status: "stock"
      });

      /* 4️⃣ CREATE MAIN DATA (LINKED TO COMPANY) */
      await MainData.create({
        company: company._id,   // ✅ LINK HERE
        registrationNumber: doc.registrationNumber,
        referType: doc.referType,
        assetType: doc.assetType,
        server: doc.server,
        simDetails: sim._id,
        deviceDetails: device._id
      });
    }

    console.log("✅ MainData + Sim + Device migration completed");
    process.exit();
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();

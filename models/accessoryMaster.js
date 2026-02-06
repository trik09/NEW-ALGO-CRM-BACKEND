const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "stock",
        "sold to customer",
        "customer demo",
        "testing",
        "with technician",
        "with cse",
        "foc",
      ],
    },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String },
  },
  { _id: false },
);

const accessoryMasterSchema = new mongoose.Schema(
  {
    accessoryManufacturer: String,

    accessoryType: {
      type: String,
      enum: [
        "RFID",
        "Fuel sensor - wired",
        "Fuel sensor - wireless",
        "RelayTemperature sensor",
        "Door sensor",
        "Drum rotation sensor",
        "SD card",
        "4g router",
        "wifi dongle",
      ],
    },

    accessoryModel: String,
    accessoryId: String,

    invoiceDate: { type: Date },
    invoiceNumber: String,

    Age: Number,

    warrantyPeriod: Number, // months

    warnatyStatus: {
      type: String,
      enum: ["active", "out of warranty"],
    },

    status: {
      type: String,
      enum: [
        "stock",
        "sold to customer",
        "customer demo",
        "testing",
        "with technician",
        "with cse",
        "foc",
      ],
      default: "stock",
    },

    // ✅ assignment (polymorphic reference)
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "assignedToModel",
      default: null,
    },
    assignedToModel: {
      type: String,
      enum: ["Employee", "Technician", "QstClient"], // ✅ CHANGE to your actual model names
      default: null,
    },

    customerName: String,

    demoFromDate: Date,
    demoToDate: Date,

    accessoryPerRate: String,

    stockEnteredAt: { type: Date },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true },
);

const AccessoryMaster = mongoose.model(
  "AccessoryMaster",
  accessoryMasterSchema,
);
module.exports = AccessoryMaster;

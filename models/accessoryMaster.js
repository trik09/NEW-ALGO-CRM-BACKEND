const mongoose = require("mongoose");

const accessoryMasterSchema = new mongoose.Schema(
  {
    accessoryManufacturer: {
      type: String,
    },
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
    accessoryModel: {
      type: String,
    },
    accessoryId: {
      type: String,
    },
    invoiceDate: {
      type: String,
    },
    invoiceNumber: {
      type: String,
    },
    Age: {
      type: Number,
    },
    warrantyPeriod: {
      type: Number, // in months
    },
    warnatyStatus: {
      type: String,
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
      ],
      default: "stock",
    },
    customerName: {
      type: String,
    },
    demoFromDate: {
      type: Date,
    },
    demoToDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

const AccessoryMaster = mongoose.model(
  "AccessoryMaster",
  accessoryMasterSchema,
);
module.exports = AccessoryMaster;

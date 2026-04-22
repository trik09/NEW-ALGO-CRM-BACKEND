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
        "defective",
      ],
    },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String },
  },
  { _id: false },
);

const deviceMasterSchema = new mongoose.Schema(
  {
    deviceManufacturer: { type: String },
    deviceType: { type: String },
    deviceModel: { type: String },
    deviceId: { type: String },

    invoiceDate: { type: Date },
    invoiceNumber: { type: String },
    deviceAge: { type: String },

    warrantyPeriod: { type: Number },
    warrantyStatus: { type: String, enum: ["active", "out of warranty"] },

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
        "defective",
      ],
      default: "stock",
    },

    // ✅ NEW: like Accessory
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "assignedToModel",
      default: null,
    },
    assignedToModel: {
      type: String,
      enum: ["QstClient", "Technician", "Employee", "r&d", "store", "cse"],
      default: null,
    },

    // ✅ keep demo dates
    demoFromDate: { type: Date },
    demoToDate: { type: Date },

    devicePerRate: String,

    stockEnteredAt: { type: Date },
    statusHistory: [statusHistorySchema],

    // Defect tracking fields
    isDefective: {
      type: Boolean,
      default: false
    },
    defectMarkedDate: Date,
    defectReason: String,
    defectImages: [{ type: String }],

    // R&D Testing fields
    testingStatus: {
      type: String,
      enum: ["pending", "tested ok", "tested not ok", null],
      default: null,
    },
    remark: { type: String, default: "" },
    remarks: [
      {
        status: { type: String, enum: ["tested ok", "tested not ok"] },
        text:   { type: String },
        images: [{ type: String }],
        addedAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],
    images: [{ type: String }],
  },
  { timestamps: true },
);

const DeviceMaster = mongoose.model("DeviceMaster", deviceMasterSchema);
module.exports = DeviceMaster;

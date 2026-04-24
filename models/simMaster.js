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
        "deactivated",
        "assign to vendor",
      ],
    },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String },
  },
  { _id: false },
);

const simMasterSchema = new mongoose.Schema(
  {
    simOwner: String,
    simProvider: String,
    simType: String,

    simNumber: { type: String, index: true },

    mobileNumber: String,
    purchaseDate: Date,

    isSimActivated: { type: Boolean, default: false },
    activationDate: String,

    monthlyRental: String,
    monthlyBillingDate: String,
    monthlyData: String,
    simAge: String,

    // (keep your old string field if you want)
    customerOrAlgoEmployeeName: String,

    demoFromDate: Date,
    demoToDate: Date,

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
        "deactivated",
        "assign to vendor",
      ],
      default: "stock",
    },

    // ✅ NEW: assignment like accessory/device
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "assignedToModel",
      default: null,
    },
    assignedToModel: {
      type: String,
      enum: ["Technician", "Employee", "QstClient", "r&d", "store", "cse"],
      default: null,
    },
    assignedToName: { type: String, default: "" },

    // ✅ NEW: stock timing
    stockEnteredAt: { type: Date },

    simPerRate: String,

    statusHistory: [statusHistorySchema],

    // Defect tracking fields
    isDefective: {
      type: Boolean,
      default: false
    },
    defectMarkedDate: Date,
    defectReason: String,
    defectImages: [{ type: String }],

    // Deactivation fields
    deactivationDate: { type: String, default: "" },
    deactivationRemarks: { type: String, default: "" },

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

const SimMaster = mongoose.model("SimMaster", simMasterSchema);
module.exports = SimMaster;

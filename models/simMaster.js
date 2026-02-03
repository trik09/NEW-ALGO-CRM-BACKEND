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
      enum: ["Technician", "Employee", "QstClient"],
      default: null,
    },
    assignedToName: { type: String, default: "" },

    // ✅ NEW: stock timing
    stockEnteredAt: { type: Date },

    statusHistory: [statusHistorySchema],
  },
  { timestamps: true },
);

const SimMaster = mongoose.model("SimMaster", simMasterSchema);
module.exports = SimMaster;

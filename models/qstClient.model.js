const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
    },
    keyClient: {
      type: Boolean,
      default: false,
    },
    billingCategory: {
      type: String,
      required: true,
    },

    companyShortName: {
      type: String,
      required: true,
    },
    gstNo: {
      type: String,
    },
    qstClientCreator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],

    // Here we store employeeId by creating employee on contact details of astClient.
    contactEmployeeIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    ],

    billingAddress: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QstClient", clientSchema);

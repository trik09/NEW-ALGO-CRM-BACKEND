const mongoose = require("mongoose");
const technicianSchema = new mongoose.Schema(
  {
    beneficiaryId: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    nickName: {
      type: String,
      required: true,
    },
    technicianCategoryType: {
      type: String,
      // required: true,
      enum: {
    values: ["payroll", "freelance"], // allowed values
    message: "{VALUE} is not a valid technician category type"
  }
    },

   salary: {
      type: Number,
      // required: true,
    },
    bankName: {
      type: String,
      // required: true,
    },

    technicianCreator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },

    location: {
      type: String,
      required: false,
    },
    accountNumber: {
      type: String,
    },
    ifscCode: {
      type: String,
    },
    state: {
      type: String,
    },
    pincode: {
      type: String,
    },

    beneficiaryName: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    skills: {
      type: [String],
    },
    experience: {
      type: String,
    },
    email:{
      type:String,
      default:""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Technician", technicianSchema);

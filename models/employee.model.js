const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  photo: {
    type: String, // File path or URL
  },
  // serviceState: {
  //   type: [String], // File path or URL
  //   default: [],
  // },


  // 👇 This state only apply(used) on quikserv orgnization employee , not on qstclient contact detail employee
  serviceStates: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State", // Reference to State collection
    }
  ],
  
  email: {
    type: String,
    required: true,
  },
  password:{
  type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ['cse', 'admin', 'superAdmin','qstClient'],
    default: 'cse',
  },
  resetPasswordToken: {
    token: String,
    expires: Date,
  },
  isEmailVerify:{
    type:Number,required:true, default:0,
  },
  phoneNumber: {
    type: String,
  },
  isTelecaller: {
    type: Boolean,
    default: false, 
  },
  location: {
    type: String,
  },
   zone:{
      type: String,
      default: ""
    },
  employeeId: {
    type: String,
  },
  address: {
    type: String,
  },
  pincode: {
    type: String,
  },
  aadharNumber: {
    type: String,
  },
  panNumber: {
    type: String,
  },
  aadharImage: {
    type: String, // File path or URL
  },
  panCardImage: {
    type: String, // File path or URL
  },
  // if employee(user) created with client contact details then this qst client ID required.
   associatedClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QstClient'
  },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);

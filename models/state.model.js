// models/State.js
const mongoose  =  require("mongoose");

const stateSchema = new mongoose.Schema({
  name: { type: String, required: true },  // e.g. "Uttar Pradesh"
  shortName: { type: String, default: "" },           // e.g. "UP"
  isActive: { type: Boolean, default: true },
//   code: { type: String },                  // e.g. "05"
});

module.exports  = mongoose.model("State", stateSchema);
  

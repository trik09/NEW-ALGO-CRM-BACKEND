

const mongoose = require('mongoose');

const resolutionSchema = new mongoose.Schema(
  {
    ResolutionName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
     createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",  
    },
  },
  
  { timestamps: true }
);

module.exports = mongoose.model('Resolution', resolutionSchema);

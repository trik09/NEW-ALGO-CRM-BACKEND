const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceName: {
    type: String,
    required: true,
  },
  deviceCreator:{
     type: mongoose.Schema.Types.ObjectId,
          ref: 'Employee', 
          required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);

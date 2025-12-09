const {  mongoose } = require("mongoose");

const securityCodeSchema = new mongoose.Schema({
  securityCode: {
    type: String,
    required: true,
    unique: true
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: false // Optional if you want to track which technician it's for
  },
  // email: {
  //   type: String,
  //   required: true
  // },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SecurityCode', securityCodeSchema);
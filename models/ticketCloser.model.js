

const mongoose = require('mongoose');

const ticketCloserSchema = new mongoose.Schema({
  reason: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
 
}, { timestamps: true });

module.exports = mongoose.model('TicketCloser', ticketCloserSchema);






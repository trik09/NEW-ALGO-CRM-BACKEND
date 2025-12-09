const mongoose = require('mongoose');

const ticketStatusSchema = new mongoose.Schema({
     statusName: {
    type: String,
    required: true,
  },
 
},{ timestamps: true });

module.exports = mongoose.model('TicketStatus', ticketStatusSchema);


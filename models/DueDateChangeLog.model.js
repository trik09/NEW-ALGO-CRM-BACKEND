const mongoose = require('mongoose');

const dueDateChangeLogSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tickets',
    required: true
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  previousDueDate: {
    type: Date,
    required: true
  },
  newDueDate: {
    type: Date,
    required: true
  },
  changeReason: {
    type: String,
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DueDateChangeLog', dueDateChangeLogSchema);
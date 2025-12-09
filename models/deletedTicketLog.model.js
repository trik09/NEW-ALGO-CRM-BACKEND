const mongoose = require("mongoose");

const deletedTicketLogSchema = new mongoose.Schema({
  // Store full snapshot of ticket document
  ticketData: {
    type: Object, // store all fields of the ticket as JSON
    required: true,
  },
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tickets", // Reference to original Ticket
    required: true,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee", // who deleted it
    required: true,
  },
  deletedByName: {
    type: String, // store username/email as snapshot
    default: "",
  },
  deletedAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model("DeletedTicketLog", deletedTicketLogSchema);

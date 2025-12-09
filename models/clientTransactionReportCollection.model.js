// const mongoose = require('mongoose');

// const TransactionReportSchema = new mongoose.Schema({
//   reportType: {
//     type: String,
//     default: "Report", // or "DR" or any other type
//   },
//   data: {
//     type: mongoose.Schema.Types.Mixed, // store the entire report JSON here
//     required: true,
//   },
//   generatedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Employee', // optional, who generated this report
//   },
//   generatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// }, { timestamps: true });

// module.exports = mongoose.model('TransactionReport', TransactionReportSchema);


const mongoose = require('mongoose');

const TransactionReportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    default: "Report", // or "DR" or any other type
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // store the entire report JSON here
    required: true,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // optional, who generated this report
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('TransactionReport', TransactionReportSchema);


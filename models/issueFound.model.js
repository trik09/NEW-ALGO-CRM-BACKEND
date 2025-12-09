// models/issueFound.model.js

const mongoose = require('mongoose');

const issueFoundSchema = new mongoose.Schema(
  {
    issueFoundName: {
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

module.exports = mongoose.model('IssueFound', issueFoundSchema);

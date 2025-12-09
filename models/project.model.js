const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    qstClient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QstClient', 
      required: true,
    },
    projectName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default:""
    },
    // status: {
    //   type: String,
    //   enum: ['pending', 'progress', 'completed'],
    //   default: 'pending',
    // },
    startDate: {
      type: Date,
      default:null
    },
    endDate: {
      type: Date,
      default:null
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
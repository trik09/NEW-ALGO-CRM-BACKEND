// Customer charge rate per vehicle
const mongoose = require('mongoose');


const chargeRateSchema = new mongoose.Schema({
  qstClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QstClient',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  taskType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },

  // 🔑 Only one of these should be filled: either `flatRate` or `rates`
  flatRate: {
    type: Number,
    min: 0,
    default: null
  },

  rates: {
    quantity_1_10: {
      type: Number,
      min: 0,
      default: null
    },
    quantity_11_20: {
      type: Number,
      min: 0,
      default: null
    },
    quantity_21_25: {
      type: Number,
      min: 0,
      default: null
    },
    quantity_26_30: {
      type: Number,
      min: 0,
      default: null
    },
    quantity_31_40: {
      type: Number,
      min: 0,
      default: null
    },
    quantity_41_50: {
      type: Number,
      min: 0,
      default: null
    },
    quantity_51_plus: {
      type: Number,
      min: 0,
      default: null
    }
  },

  // Optional: add a flag to clarify which pricing is used
  isQuantityBased: { // quantity_1_10 like 
    type: Boolean,
    required: false
  }

}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

module.exports = mongoose.model('CustomerChargeRate', chargeRateSchema);

// const mongoose= require("mongoose");

// const MonthlyMarginSchema = new mongoose.Schema({
 
// },{
//     timestamps:true
// })


// module.exports = mongoose.model('MonthlyMargin', MonthlyMarginSchema);




// const mongoose = require("mongoose");

// const MonthlyMarginSchema = new mongoose.Schema({
//   financialMonthKey: { type: String, required: true },   // e.g. "2025-09"
//   financialYearLabel: { type: String, required: true },  // e.g. "2025-2026"
//   monthName: { type: String, required: true },           // e.g. "September"

//   payrollTotalCustomerCharges: { type: Number, default: 0 },
//   payrollTotalActualSalaries: { type: Number, default: 0 },
//   payrollDeclaredSalaries: { type: Number, default: 0 },
//   payrollTicketCount: { type: Number, default: 0 },

//   freelanceTotalCustomerCharges: { type: Number, default: 0 },
//   freelanceTotalTechCharges: { type: Number, default: 0 },

//   totalCustomerChargesAll: { type: Number, default: 0 },
//   totalVehiclesInMonth: { type: Number, default: 0 },

//   payrollMargin: { type: Number, default: 0 },
//   freelanceMargin: { type: Number, default: 0 },
//   totalMargin: { type: Number, default: 0 },

//   totalTickets: { type: Number, default: 0 },
//   totalVehicles: { type: Number, default: 0 }
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model("MonthlyMargin", MonthlyMarginSchema);








const mongoose = require("mongoose");

const MonthlyMarginSchema = new mongoose.Schema(
  {
    financialMonthKey: { type: String, required: true },   // e.g. "2025-09"
    financialYearLabel: { type: String },                  // e.g. "2025-2026"
    year: { type: Number, required: true },                // e.g. 2025
    month: { type: Number, required: true },               // e.g. 9
    monthName: { type: String, required: true },           // e.g. "September"

    // Payroll
    payrollTicketCount: { type: Number, default: 0 },
    payrollVehicleCount: { type: Number, default: 0 },
    payrollTotalCustomerCharges: { type: Number, default: 0 },
    payrollDeclaredSalaries: { type: Number, default: 0 },
    payrollTotalTechCharges: { type: Number, default: 0 },
    payrollTechnicianCount: { type: Number, default: 0 },

    // Freelance
    freelanceTicketCount: { type: Number, default: 0 },
    freelanceVehicleCount: { type: Number, default: 0 },
    freelanceTotalCustomerCharges: { type: Number, default: 0 },
    freelanceTotalTechCharges: { type: Number, default: 0 },

    // Totals
    totalTicketsInMonth: { type: Number, default: 0 },
    totalVehiclesInMonth: { type: Number, default: 0 },
    totalCustomerChargesAll: { type: Number, default: 0 },
    totalTickets: { type: Number, default: 0 },
    totalVehicles: { type: Number, default: 0 },

    // Margins
    payrollMargin: { type: Number, default: 0 },
    freelanceMargin: { type: Number, default: 0 },
    grossMargin: { type: Number, default: 0 },
    totalMargin: { type: Number, default: 0 },
    marginPerVehicle: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("MonthlyMargin", MonthlyMarginSchema);

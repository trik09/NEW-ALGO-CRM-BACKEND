// import cron from "node-cron";
 
// import {getTechnicianMargins} from ".././controllers/ticket.controller"

// // Run at 2 PM on the 5th of every month
// cron.schedule("0 2 5 * *", async () => {
//   console.log("🚀 Cron Job Started at 02:00 IST on the 5th");


//   // Call controller function (without req/res since cron triggers it)
//   await getTechnicianMargins(null, null);
//   }, {
//   timezone: "Asia/Kolkata"
// });

//   console.log("✅ Cron Job Finished.");
// });




// import cron from "node-cron";
// import { getTechnicianMargins } from "../controllers/ticket.controller";

// // Runs at 02:00 (2 AM) on the 5th day of every month in Asia/Kolkata timezone
// cron.schedule("0 2 5 * *", async () => {
//   console.log("🚀 Cron Job Started at 02:00 IST on the 5th");

//   try {
//     const result = await getTechnicianMargins(); // or await getTechnicianMargins({});
//     console.log("✅ Cron job finished. Result summary:",
//       Array.isArray(result?.monthly) ? `monthly rows=${result.monthly.length}` : typeof result
//     );
//   } catch (err) {
//     console.error("❌ Cron job failed:", err);
//   }
// }, {
//   timezone: "Asia/Kolkata"
// });





// const cron = require("node-cron");
// const { getTechnicianMargins } = require("../controllers/ticket.controller");

// /**
//  * Compute the current date in Asia/Kolkata (year, month, day).
//  * We use Intl.DateTimeFormat with timeZone to avoid relying on server local TZ.
//  */
// function getNowInKolkataParts() {
//   const now = new Date();
//   const parts = new Intl.DateTimeFormat('en-GB', {
//     timeZone: 'Asia/Kolkata',
//     year: 'numeric',
//     month: 'numeric',
//     day: 'numeric',
//     hour: 'numeric',
//     minute: 'numeric',
//     second: 'numeric'
//   }).formatToParts(now);

//   const map = {};
//   for (const p of parts) {
//     if (p.type && p.value) map[p.type] = p.value;
//   }
//   return {
//     year: Number(map.year),
//     month: Number(map.month), // 1..12
//     day: Number(map.day),
//     hour: Number(map.hour || 0),
//     minute: Number(map.minute || 0),
//     second: Number(map.second || 0)
//   };
// }

// /**
//  * Given the current IST date, return the previous month (1..12) and the calendar year that month belongs to.
//  * Also compute the financialYearLabel (FY starts Apr 1 -> Mar 31).
//  *
//  * Example:
//  *  - If IST now is 5 Sept 2025 -> previousMonth = 8, prevYear = 2025, FY = "2025-2026"
//  *  - If IST now is 5 Jan 2026 -> previousMonth = 12, prevYear = 2025, FY = "2025-2026"
//  */
// function computePrevMonthAndFYFromIST() {
//   const { year: istYear, month: istMonth } = getNowInKolkataParts();

//   // previous month calculation
//   let prevMonth = istMonth - 1;
//   let prevYear = istYear;
//   if (prevMonth === 0) {
//     prevMonth = 12;
//     prevYear = istYear - 1;
//   }

//   // financial year start year: if month >= 4 => FY starts same year, else FY starts prevYear
//   const fyStartYear = prevMonth >= 4 ? prevYear : prevYear - 1;
//   const financialYearLabel = `${fyStartYear}-${fyStartYear + 1}`;

//   return { month: prevMonth, year: prevYear, financialYearLabel };
// }

// // Runs at 02:00 (2 AM) on the 5th day of every month in Asia/Kolkata timezone
// cron.schedule("07 16 24 * *", async () => {
//   console.log("🚀 Cron Job Started at 02:00 IST on the 5th");

//   try {
//     const { month: prevMonth, year: prevYear, financialYearLabel } = computePrevMonthAndFYFromIST();

//     console.log(`Computed previous month for processing: month=${prevMonth}, year=${prevYear}, financialYear=${financialYearLabel}`);

//     // Call the controller for the previous month. Pass month as a number (1..12)
//     // Your getTechnicianMargins accepts { month, financialYearLabel } and will compute from/to.
//     const result = await getTechnicianMargins({ month: prevMonth, financialYearLabel });


//     console.log("result", result);
    
//     console.log("✅ Cron job finished. Returned monthly rows:", Array.isArray(result?.monthly) ? result.monthly.length : typeof result);
//   } catch (err) {
//     console.error("❌ Cron job failed:", err);
//   }
// }, {
//   timezone: "Asia/Kolkata"
// });










// Crone-Job/MonthlyMarginCron.js
const cron = require('node-cron');
const { getTechnicianMargins } = require('../controllers/ticket.controller');
//const MonthlyMargin = require('../models/MonthlyMargin.model');
const mongoose = require('mongoose');

/** Helpers to compute IST date parts + previous month & FY (same as before) */
function getNowInKolkataParts() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false
  }).formatToParts(now);

  const map = {};
  for (const p of parts) if (p.type && p.value) map[p.type] = p.value;
  return {
    year: Number(map.year),
    month: Number(map.month), // 1..12
    day: Number(map.day),
    hour: Number(map.hour || 0),
    minute: Number(map.minute || 0),
    second: Number(map.second || 0)
  };
}

function computePrevMonthAndFYFromIST() {
  const { year: istYear, month: istMonth } = getNowInKolkataParts();

  let prevMonth = istMonth - 1;
  let prevYear = istYear;
  if (prevMonth === 0) { prevMonth = 12; prevYear = istYear - 1; }

  const fyStartYear = prevMonth >= 4 ? prevYear : prevYear - 1;
  const financialYearLabel = `${fyStartYear}-${fyStartYear + 1}`;

  return { month: prevMonth, year: prevYear, financialYearLabel };
}

/** Map one aggregation row -> model doc object (only fields you want) */
// function mapMonthlyRowToDoc(m) {
//   return {
//     financialMonthKey: m.financialMonthKey,
//     financialYearLabel: m.financialYearLabel,
//     year: m.year,
//     month: m.month,
//     monthName: m.monthName,

//     payrollTotalCustomerCharges: Number(m.payrollTotalCustomerCharges || 0),
//     payrollTotalActualSalaries: Number(m.payrollTotalActualSalaries || 0),
//     payrollDeclaredSalaries: Number(m.payrollDeclaredSalaries || 0),
//     payrollTicketCount: Number(m.payrollTicketCount || 0),

//     freelanceTotalCustomerCharges: Number(m.freelanceTotalCustomerCharges || 0),
//     freelanceTotalTechCharges: Number(m.freelanceTotalTechCharges || 0),

//     totalCustomerChargesAll: Number(m.totalCustomerChargesAll || 0),
//     totalTicketsInMonth: Number(m.totalTicketsInMonth || m.totalTickets || 0),
//     totalVehiclesInMonth: Number(m.totalVehiclesInMonth || m.totalVehicles || 0),

//     payrollMargin: Number(m.payrollMargin || 0),
//     freelanceMargin: Number(m.freelanceMargin || 0),
//     totalMargin: Number(m.totalMargin || ((m.payrollMargin || 0) + (m.freelanceMargin || 0))),

//     totalTickets: Number(m.totalTickets || m.totalTicketsInMonth || 0),
//     totalVehicles: Number(m.totalVehicles || m.totalVehiclesInMonth || 0)
//   };
// }

/** Map one aggregation row -> model doc object */
function mapMonthlyRowToDoc(m) {
  return {
    financialMonthKey: m.financialMonthKey,
    financialYearLabel: m.financialYearLabel,
    year: m.year,
    month: m.month,
    monthName: m.monthName,

    // Payroll
    payrollTicketCount: Number(m.payrollTicketCount || 0),
    payrollVehicleCount: Number(m.payrollVehicleCount || 0),
    payrollTotalCustomerCharges: Number(m.payrollTotalCustomerCharges || 0),
    payrollDeclaredSalaries: Number(m.payrollDeclaredSalaries || 0),
    payrollTotalTechCharges: Number(m.payrollTotalTechCharges || 0),
    payrollTechnicianCount: Number(m.payrollTechnicianCount || 0),

    // Freelance
    freelanceTicketCount: Number(m.freelanceTicketCount || 0),
    freelanceVehicleCount: Number(m.freelanceVehicleCount || 0),
    freelanceTotalCustomerCharges: Number(m.freelanceTotalCustomerCharges || 0),
    freelanceTotalTechCharges: Number(m.freelanceTotalTechCharges || 0),

    // Totals
    totalTicketsInMonth: Number(m.totalTicketsInMonth || m.totalTickets || 0),
    totalVehiclesInMonth: Number(m.totalVehiclesInMonth || m.totalVehicles || 0),
    totalCustomerChargesAll: Number(m.totalCustomerChargesAll || 0),
    totalTickets: Number(m.totalTickets || m.totalTicketsInMonth || 0),
    totalVehicles: Number(m.totalVehicles || m.totalVehiclesInMonth || 0),

    // Margins
    payrollMargin: Number(m.payrollMargin || 0),
    freelanceMargin: Number(m.freelanceMargin || 0),
    grossMargin: Number(m.grossMargin || 0),
    totalMargin: Number(m.totalMargin || ((m.payrollMargin || 0) + (m.freelanceMargin || 0))),
    marginPerVehicle: Number(m.marginPerVehicle || 0),
  };
}

/** Wait for mongoose to be connected (optional safety) */
function waitForMongoose(timeoutMs = 30000) {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const onConnected = () => { cleanup(); resolve(); };
    const onError = (err) => { cleanup(); reject(err); };
    const cleanup = () => {
      mongoose.connection.off('connected', onConnected);
      mongoose.connection.off('error', onError);
      clearTimeout(timer);
    };
    mongoose.connection.on('connected', onConnected);
    mongoose.connection.on('error', onError);
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Timed out waiting for mongoose connection'));
    }, timeoutMs);
  });
}

/**
 * Actual cron task:
 * - compute previous month & financialYearLabel
 * - call getTechnicianMargins({ month, financialYearLabel })
 * - upsert month docs into MonthlyMargin collection
 */
cron.schedule('0 2 5 * *', async () => { // runs 02:00 IST on 5th (adjust expr as needed)
  console.log('🚀 MonthlyMarginCron triggered (IST 02:00 on 5th)');

  try {
    // ensure DB ready (prevents buffering errors)
    await waitForMongoose(30000);

    const { month: prevMonth, year: prevYear, financialYearLabel } = computePrevMonthAndFYFromIST();
    console.log('Computed previous month:', { prevMonth, prevYear, financialYearLabel });

    const result = await getTechnicianMargins({ month: prevMonth, financialYearLabel });
    if (!result || !Array.isArray(result.monthly) || result.monthly.length === 0) {
      console.log('No monthly rows returned from controller, nothing to save.');
      return;
    }


    console.log(result);
    
    const ops = result.monthly.map((m) => {
      const doc = mapMonthlyRowToDoc(m);
      // Use financialMonthKey + financialYearLabel as unique key for upsert
      const filter = { financialMonthKey: doc.financialMonthKey, financialYearLabel: doc.financialYearLabel };
      const update = { $set: doc, $setOnInsert: { createdAt: new Date() } };
      return { updateOne: { filter, update, upsert: true } };
    });

    // Perform bulk upsert
    const bulkRes = await MonthlyMargin.bulkWrite(ops, { ordered: false });
    console.log('✅ Monthly upsert bulkWrite result:', bulkRes.result || bulkRes); // older mongoose versions
    console.log(`Saved/updated ${result.monthly.length} month(s)`);

  } catch (err) {
    console.error('❌ MonthlyMarginCron failed:', err);
  }
}, {
  timezone: 'Asia/Kolkata'
});

module.exports = {};

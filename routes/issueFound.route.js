

    
const express = require('express');
const router = express.Router();
// const { bulkCreateIssues,getAllIssueFound } = require('../controllers/issueFound.controller');
const issueFoundController = require("../controllers/issueFound.controller");
const { isAuthenticated, authorizeRoles } = require('../middleware/auth.middleware');

router.get('/get-all-for-table-show', isAuthenticated, issueFoundController.getAllIsuueForTableShow);

// this sis for dropdown options (don't add any things which make impact on all data retrival in form dropdown)
router.get('/get-all-issueFound', issueFoundController.getAllIssueFound);
router.post('/create-issuefound',isAuthenticated,authorizeRoles('superAdmin', 'admin'),issueFoundController.createIssueFound);
router.patch('/update-issuefound/:id',isAuthenticated,authorizeRoles('superAdmin', 'admin'),issueFoundController.updateIssueFound);
router.delete('/delete/:id',isAuthenticated,authorizeRoles('superAdmin', 'admin'),issueFoundController.deleteIssueFound);

// It is used to create bulk issue found records
router.post('/bulk-issueFoundCreate', isAuthenticated, authorizeRoles('superAdmin', 'admin'), issueFoundController.bulkCreateIssues);

router.get("/export-issuefound", issueFoundController.exportIssuesByDate);




// // ==============================================================================================
// // this route is to check how many tickets have issueFound or resolution as string but missing the corresponding reference (created this date: 📅2025-09-09)⚠️👇👇👇



// // GET /api/tickets/check-missing-refs
// const Ticket = require("../models/ticket.model");
// const IssueFound = require("../models/issueFound.model");
// const Resolution = require("../models/resolution.model");

// // router.get("/stats-issue-resolution",async (req, res) => {
// //   try {
// //     const tickets = await Ticket.find({
// //       $or: [
// //         { $and: [{ issueFound: { $ne: "" } }, { issueFoundRef: { $exists: false } }] },
// //         { $and: [{ resolution: { $ne: "" } }, { resolutionRef: { $exists: false } }] },
// //       ],
// //     });

// //     return res.json({
// //       success: true,
// //       totalTickets: tickets.length,
// //       ticketsWithIssueFoundOnly: tickets.filter(t => t.issueFound && !t.issueFoundRef).length,
// //       ticketsWithResolutionOnly: tickets.filter(t => t.resolution && !t.resolutionRef).length,
// //       ticketsWithBoth: tickets.filter(t => t.issueFound && !t.issueFoundRef && t.resolution && !t.resolutionRef).length,
// //     });
// //   } catch (err) {
// //     return res.status(500).json({ success: false, message: err.message });
// //   }
// // });


// router.get("/stats-issue-resolution", async (req, res) => {
//   try {
//     const allTickets = await Ticket.find({});
    
//     let analysis = {
//       totalTickets: allTickets.length,
//       ticketsWithBothStringAndRef: 0,
//       ticketsWithOnlyString: 0,
//       ticketsWithOnlyRef: 0,
//       ticketsWithNoData: 0,
//       ticketsWithMismatchedData: 0,
//       issueFoundBreakdown: {
//         hasString: 0,
//         hasRef: 0,
//         both: 0
//       },
//       resolutionBreakdown: {
//         hasString: 0,
//         hasRef: 0,
//         both: 0
//       }
//     };

//     allTickets.forEach(ticket => {
//       const hasIssueString = ticket.issueFound && ticket.issueFound.trim() !== '';
//       const hasIssueRef = ticket.issueFoundRef;
//       const hasResolutionString = ticket.resolution && ticket.resolution.trim() !== '';
//       const hasResolutionRef = ticket.resolutionRef;

//       // Count tickets with both string and ref
//       if ((hasIssueString && hasIssueRef) || (hasResolutionString && hasResolutionRef)) {
//         analysis.ticketsWithBothStringAndRef++;
//       }

//       // Count tickets with only string
//       if ((hasIssueString && !hasIssueRef) || (hasResolutionString && !hasResolutionRef)) {
//         analysis.ticketsWithOnlyString++;
//       }

//       // Count tickets with only ref
//       if ((!hasIssueString && hasIssueRef) || (!hasResolutionString && hasResolutionRef)) {
//         analysis.ticketsWithOnlyRef++;
//       }

//       // Count tickets with no data
//       if ((!hasIssueString && !hasIssueRef) && (!hasResolutionString && !hasResolutionRef)) {
//         analysis.ticketsWithNoData++;
//       }

//       // Individual field analysis
//       if (hasIssueString) analysis.issueFoundBreakdown.hasString++;
//       if (hasIssueRef) analysis.issueFoundBreakdown.hasRef++;
//       if (hasIssueString && hasIssueRef) analysis.issueFoundBreakdown.both++;

//       if (hasResolutionString) analysis.resolutionBreakdown.hasString++;
//       if (hasResolutionRef) analysis.resolutionBreakdown.hasRef++;
//       if (hasResolutionString && hasResolutionRef) analysis.resolutionBreakdown.both++;
//     });

//     res.json({
//       success: true,
//       analysis,
//       message: 'Analysis completed successfully'
//     });

//   } catch (error) {
//     console.error('Analysis error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error analyzing ticket data',
//       error: error.message
//     });
//   }
// })






module.exports = router;



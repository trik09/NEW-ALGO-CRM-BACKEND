const TicketCloser = require('../models/ticketCloser.model');
//const Employee = require('../models/employee.model');
const mongoose = require("mongoose")
const dayjs = require("dayjs");




function normalizeStringAndRemoveInbetweenSpace(name) {
  // narmalize and remove multiple space from between words and make ower case to all 
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}



 exports.createTicketClosersBulk = async (req, res) => {
  try {
    const { reasons, creator } = req.body;

    if (!Array.isArray(reasons) || reasons.length === 0) {
      return res.status(400).json({ error: 'Reasons must be a non-empty array.' });
    }

    if (!creator) {
      return res.status(400).json({ error: 'Creator (Employee ID) is required.' });
    }

    // Check if creator exists
    const employeeExists = await Employee.findById(creator);
    if (!employeeExists) {
      return res.status(404).json({ error: 'Creator (Employee) not found.' });
    }

    // Prepare valid entries
    const validData = reasons
      .filter(r => r.reason && typeof r.reason === 'string')
      .map(r => ({
        reason: r.reason.trim(),
        creator
      }));

    if (validData.length === 0) {
      return res.status(400).json({ error: 'No valid reasons provided.' });
    }

    const inserted = await TicketCloser.insertMany(validData);

    res.status(201).json({
      message: `${inserted.length} ticket closers created successfully.`,
      ticketClosers: inserted,
    });
  } catch (error) {
    console.error('Error in createTicketClosersBulk:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


exports.getAllTicketClosersForTable = async (req, res) => {
  try {
    // Get query parameters with defaults
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Create search query if search term exists
    const query = search 
      ? { 
          reason: { 
            $regex: normalizeStringAndRemoveInbetweenSpace(search), 
            $options: 'i' // case insensitive
          } 
        } 
      : {};

    // Get total count of matching documents (for pagination)
    const total = await TicketCloser.countDocuments(query);

    // Get paginated results with creator population
    const ticketClosers = await TicketCloser.find(query)
      .populate('creator', ' name employeeId')
      .sort({ reason: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      message: 'Ticket closers retrieved successfully',
      data: ticketClosers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllTicketClosers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// It is used for dropdown input options in forms
exports.getAllTicketClosers = async (req, res) => {
  try {
   
    const ticketClosers = await TicketCloser.find({})
      .populate('creator', 'name employeeId')
      .sort({ reason: 1 });

    res.status(200).json({
      message: 'Ticket closers retrieved successfully',
      status: 'success',
      ticketClosers,
      success:true
    });
  } catch (error) {
    console.error('Error in getAllTicketClosers:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};


// Create Reason
exports.createTicketClosere = async (req, res) => {
  try {
    let { reason, creator } = req.body;
    reason = normalizeStringAndRemoveInbetweenSpace(reason);
    req.body.reason = reason

    if (!reason || !creator) {
      return res.status(400).json({ success: false, message: "Reason and Creator are required." });
    }

    // Check for existing reason (case-insensitive)
    const existing = await TicketCloser.findOne({ reason: { $regex: new RegExp(`^${reason}$`, 'i') } });

    if (existing) {
      return res.status(409).json({ success: false, message: "This reason already exists." });
    }

    const newTicketCloser = new TicketCloser({ reason, creator });
    const savedTicketCloser = await newTicketCloser.save();

    return res.status(201).json({
      success: true,
      message: "Ticket closer created successfully.",
      data: savedTicketCloser,
    });
  } catch (error) {
    console.error("Error creating TicketCloser:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Update Reason
exports.updateTicketClosere = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: "Reason is required." });
    }

    // Check if another entry has the same reason (case-insensitive)
    const duplicate = await TicketCloser.findOne({
      _id: { $ne: id },
      reason: { $regex: new RegExp(`^${reason}$`, 'i') },
    });

    if (duplicate) {
      return res.status(409).json({ success: false, message: "Another reason with this name already exists." });
    }

    const updated = await TicketCloser.findByIdAndUpdate(
      id,
      { reason },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Reason not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Reason updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating reason:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// Delete Reason
exports.deleteTicketClosere = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await TicketCloser.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Reason not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Reason deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting reason:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};


exports.exportTicketClosers = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "fromDate and toDate are required",
      });
    }

    const from = dayjs(fromDate).startOf("day").toDate();
    const to = dayjs(toDate).endOf("day").toDate();

    const ticketClosers = await TicketCloser.find({
      createdAt: { $gte: from, $lte: to },
    })
      .sort({ createdAt: -1 })
      .populate("creator", "name employeeId");

    return res.status(200).json({
      success: true,
      message: "Ticket closers exported successfully",
      data: ticketClosers,
    });
  } catch (error) {
    console.error("Error exporting ticket closers:", error);
    return res.status(500).json({
      success: false,
      message: "Error exporting ticket closers",
      error: error.message,
    });
  }
};
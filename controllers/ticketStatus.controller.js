// const Status = require("../models/ticketStatus.model");
// const Status = require('../models/ticketStatus.model');
const Status = require("../models/ticketStatus.model");
const mongoose = require("mongoose");

// const normalizeStatusName = (name) => {
//   return name.trim().toLowerCase().replace(/\s+/g, '-');
// };

function normalizeStatusName(name) {
  // narmalize and remove multiple space from between words and make lower case to all for symetrisity
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

exports.createstatus = async (req, res) => {
  try {
    const { statusName } = req.body;

    if (!statusName || statusName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Status Name is required",
      });
    }

    const normalizedStatus = normalizeStatusName(statusName);

    // Prevent duplicates (ignore soft deleted)
    const existingStatus = await Status.findOne({
      statusName: normalizedStatus,
    });

    if (existingStatus) {
      return res.status(409).json({
        success: false,
        message: "Status with this name already exists",
      });
    }

    const newStatus = new Status({
      statusName: normalizedStatus,
    });

    await newStatus.save();

    res.status(201).json({
      success: true,
      message: "Ticket status created successfully",
      data: newStatus,
    });
  } catch (error) {
    console.error("Error creating ticket status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updatestatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusName } = req.body;

    if (!statusName || statusName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Status Name is required",
      });
    }
    // console.log(statusName, "status name");
    const normalizedStatus = normalizeStatusName(statusName);
    // console.log(normalizedStatus);
    // Prevent name conflict
    const conflict = await Status.findOne({
      _id: { $ne: id },
      statusName: normalizedStatus,
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Another status with this name already exists",
      });
    }

    const updatedStatus = await Status.findOneAndUpdate(
      { _id: id },
      { statusName: normalizedStatus },
      { new: true, runValidators: true }
    );

    if (!updatedStatus) {
      return res.status(404).json({
        success: false,
        message: "Status not found or has been deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: updatedStatus,
    });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getAllStatuses = async (req, res) => {
  try {

    const statuses = await Status.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Ticket statuses fetched successfully",
      data: statuses,
    });
  } catch (error) {
    console.error("Error fetching ticket statuses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
exports.getAllStatusForTableShow = async (req, res) => {
  try {
    const { search } = req.query;

    const query = {};

    if (search && search.trim() !== "") {
      const normalizedSearch = normalizeStatusName(search);
      query.statusName = { $regex: normalizedSearch, $options: "i" }; // match against normalized form
    }

    const statuses = await Status.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Ticket statuses fetched successfully",
      data: statuses,
    });
  } catch (error) {
    console.error("Error fetching ticket statuses:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// exports.deletestatus = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deletedStatus = await Status.findByIdAndDelete(id);

//     if (!deletedStatus) {
//       return res.status(404).json({
//         success: false,
//         message: "Status not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Ticket status deleted successfully",
//       data: deletedStatus,
//     });
//   } catch (error) {
//     console.error("Error deleting ticket status:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };


exports.deletestatus = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status ID",
      });
    }

    // 2. Find the status first
    const status = await Status.findById(id);

    if (!status) {
      return res.status(404).json({
        success: false,
        message: "Status not found",
      });
    }

    // 3. Protect "Work Done" and "Work Not Done" from deletion (case-insensitive)
    const protectedStatuses = ["work done", "work not done"];

    if (protectedStatuses.includes(status.statusName.trim().toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete status: "${status.statusName}" is protected`,
      });
    }

    // 4. Proceed to delete
    await Status.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Ticket status deleted successfully",
      data: status,
    });
  } catch (error) {
    console.error("Error deleting ticket status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




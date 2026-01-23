const IssueFound = require("../models/issueFound.model");
const dayjs = require("dayjs");

function normalizeStringAndRemoveInbetweenSpace(name) {
  // narmalize and remove multiple space from between words and make ower case to all
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

// Get all issues
exports.getAllIssueFound = async (req, res) => {
  try {
    const issues = await IssueFound.find().sort({ createdAt: -1 });

    return res
      .status(200)
      .json({
        success: true,
        message: "All available issueFound get successfully",
        data: issues,
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
      error: error.message,
    });
  }
};

 
exports.getAllIsuueForTableShow = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = search 
      ? { issueFoundName: { $regex: search, $options: 'i' } } 
      : {};

    // Get total count for pagination
    const total = await IssueFound.countDocuments(searchQuery);

    // Get paginated results
    const issues = await IssueFound.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "All available issueFound get successfully",
      data: issues,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
      error: error.message,
    });
  }
};


// Bulk create issues
exports.bulkCreateIssues = async (req, res) => {
  try {
    const issues = req.body.issues; // expecting array of { issueFoundName }

    if (!Array.isArray(issues) || issues.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Issues array is required" });
    }

    // Optional: remove duplicates by name
    const uniqueIssues = Array.from(
      new Map(
        issues.map((item) => [item.issueFoundName.trim().toLowerCase(), item])
      ).values()
    );

    const result = await IssueFound.insertMany(uniqueIssues, {
      ordered: false,
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error.name === "BulkWriteError") {
      return res.status(207).json({
        success: false,
        message:
          "Partial success. Some issues may already exist or failed validation.",
        error: error.message,
      });
    }
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

exports.createIssueFound = async (req, res) => {
  try {
    const { createbBy } = req.body;
    let { issueFoundName } = req.body;
    // narmalize the name and remove in between words spaces and make  loawer case
    issueFoundName = normalizeStringAndRemoveInbetweenSpace(issueFoundName);
    req.body.issueFoundName = issueFoundName;

    if (!issueFoundName) {
      return res.status(400).json({
        success: false,
        message: "Issue Name is Required",
      });
    }

    // check for issue already exists

    const existing = await IssueFound.findOne({ issueFoundName });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Issue already exists",
      });
    }

    const newIssue = await IssueFound.create({
      issueFoundName,
      createbBy,
    });
    return res.status(201).json({
      success: true,
      data: newIssue,
      message: "IssueFound successfully created",
    });
  } catch (err) {
    console.log("Create Issue Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Update an Issue by Id

exports.updateIssueFound = async (req, res) => {
  try {
    const { id } = req.params;
    let { issueFoundName } = req.body;

    if (!issueFoundName || issueFoundName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Issue Name is required"
      });
    }

    // Normalize the issue name
    issueFoundName = normalizeStringAndRemoveInbetweenSpace(issueFoundName);
    req.body.issueFoundName = issueFoundName;

    // Check if the normalized name already exists (excluding the current record)
    const existing = await IssueFound.findOne({
      _id: { $ne: id },
      issueFoundName: issueFoundName
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Issue Name already exists"
      });
    }

    // Proceed to update
    const updated = await IssueFound.findByIdAndUpdate(
      id,
      { issueFoundName },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Issue not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: updated
    });

  } catch (err) {
    console.log("Update Issue Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

// DELETE IssueFound by ID
exports.deleteIssueFound = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await IssueFound.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (err) {
    console.error("Delete Issue Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};



exports.exportIssuesByDate = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    // Validate inputs
    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "fromDate and toDate are required",
      });
    }

    // Convert to proper date objects
    const from = dayjs(fromDate).startOf("day").toDate();
    const to = dayjs(toDate).endOf("day").toDate();

    // Query documents within date range
    const issues = await IssueFound.find({
      createdAt: { $gte: from, $lte: to },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Issues exported successfully",
      data: issues,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
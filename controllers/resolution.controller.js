

const Resolution = require('../models/resolution.model');
const dayjs = require("dayjs");




function normalizeStringAndRemoveInbetweenSpace(name) {
  // narmalize and remove multiple space from between words and make ower case to all 
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

 
// Get all resolutions (it is used only for show in dropdown in forms sections)
exports.getAllResolutions = async (req, res) => {
  try {
    const resolutions = await Resolution.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message:'Get all resolutions successfully',
      data: resolutions
    });
  } catch (err) {
    console.error("Error fetching resolutions:", err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// it is used for table view with all search/filter/pagination features
exports.getAllResolutionsForTableShow = async (req, res) => {
  try {
    // Get query parameters with defaults
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Create search query if search term exists
    const searchQuery = search 
      ? { 
          ResolutionName: { 
            $regex: normalizeStringAndRemoveInbetweenSpace(search), 
            $options: 'i' // case insensitive
          } 
        } 
      : {};

    // Get total count of matching documents (for pagination)
    const total = await Resolution.countDocuments(searchQuery);

    // Get paginated results
    const resolutions = await Resolution.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      message: 'Resolutions fetched successfully',
      data: resolutions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error("Error fetching resolutions:", err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};


exports.getAllResolutionsForExport = async (req, res) => {
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

    const resolutions = await Resolution.find({
      createdAt: { $gte: from, $lte: to },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Resolutions fetched successfully",
      data: resolutions,
    });
  } catch (error) {
    console.error("Error fetching resolutions:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching resolutions",
      error: error.message,
    });
  }
};

// create new resolution
exports.createResolution = async (req,res) => {
  try {
    let {ResolutionName, createdBy} = req.body;
    // narmalize and remove multiple space from between words and make ower case to all
    ResolutionName = normalizeStringAndRemoveInbetweenSpace(ResolutionName);
    req.body.ResolutionName = ResolutionName;

    if(!ResolutionName) {
      return res.status(400).json({
        success: false,
        message : "Resolution name is Required"
      });
    }

    const existing = await Resolution.findOne({ResolutionName});
    if(existing) {
      return res.status(409).json({
        success:false,
        message: "Resolution already exists"  
      });
    }

 
    // Create resolution instance
    const newResolution = new Resolution({
      ResolutionName: ResolutionName.trim(),
      createdBy,
    });

    // Save to DB
    await newResolution.save();

    return res.status(201).json({
      success: true,
      message: "Resolution created successfully",
      data: newResolution,
    });

  } catch (err) {
    console.error("Error creating resolution",err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// Update Resolution by ID
exports.updateResolution = async (req, res) => {
  try {
    const { id } = req.params;
    let { ResolutionName } = req.body;

    if (!ResolutionName) {
      return res.status(400).json({
        success: false,
        message: "Resolution Name is required"
      });
    }

    // Normalize input
    ResolutionName = normalizeStringAndRemoveInbetweenSpace(ResolutionName);
    req.body.ResolutionName = ResolutionName;

    // Check if another resolution already exists with this name (excluding current one)
    const existing = await Resolution.findOne({
      _id: { $ne: id },
      ResolutionName: ResolutionName
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Resolution Name already exists"
      });
    }

    // Update the resolution
    const updated = await Resolution.findByIdAndUpdate(
      id,
      { ResolutionName },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Resolution not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: updated
    });

  } catch (err) {
    console.error("Error updating resolution:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// Delete Resolution by ID
exports.deleteResolution = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Resolution.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Resolution not found" });
    }

    return res.status(200).json({ 
      success: true, 
      message: "Resolution deleted successfully" });

  } catch (err) {
    console.error("Error deleting resolution:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Server error" });
  }
};




// Bulk create resolutions
exports.bulkCreateResolutions = async (req, res) => {
  try {
    const resolutions = req.body.resolutions;

    if (!Array.isArray(resolutions) || resolutions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Resolutions array is required'
      });
    }

    // Remove duplicates (case insensitive)
    const uniqueResolutions = Array.from(
      new Map(resolutions.map(item => [item.ResolutionName.trim().toLowerCase(), item])).values()
    );

    const result = await Resolution.insertMany(uniqueResolutions, { ordered: false });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.name === 'BulkWriteError') {
      return res.status(207).json({
        success: false,
        message: 'Partial success. Some entries may already exist or failed validation.',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


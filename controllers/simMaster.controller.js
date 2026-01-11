const mongoose = require("mongoose");
const simMasterModel = require("../models/simMaster");

exports.getAllSimMasters = async (req, res) => {
  try {
    console.log("GET /simMaster/get-all-simMasters - Request received");

    // Extract pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Default 20 records per page
    const skip = (page - 1) * limit;

    // Extract search parameters
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { simOwner: { $regex: search, $options: "i" } },
          { simProvider: { $regex: search, $options: "i" } },
          { simNumber: { $regex: search, $options: "i" } },
          { mobileNumber: { $regex: search, $options: "i" } },
          { customerOrAlgoEmployeeName: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Get total count for pagination info
    const totalCount = await simMasterModel.countDocuments(searchQuery);

    // Get paginated data
    const simMasters = await simMasterModel
      .find()
      .select("-statusHistory") // Exclude statusHistory array for better performance
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log(
      `Found ${simMasters.length} SIM masters (Page ${page}/${totalPages}, Total: ${totalCount})`
    );

    res.status(200).json({
      success: true,
      data: {
        simMasters,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null,
        },
      },
    });
  } catch (error) {
    console.error("Error in getAllSimMasters:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createSimMaster = async (req, res) => {
  try {
    const {
      simOwner,
      simProvider,
      simType,
      simNumber,
      mobileNumber,
      purchaseDate,
      isSimActivated,
      activationDate,
      monthlyRental,
      monthlyDate, // Frontend sends monthlyDate
      monthlyData,
      simAge,
      customerOrAlgoEmployeeName,
      status,
    } = req.body;

    const existingSim = await simMasterModel.findOne({ simNumber });
    if (existingSim) {
      return res.status(400).json({
        success: false,
        message: "SIM number already exists",
      });
    }

    const simData = {
      simOwner,
      simProvider,
      simNumber,
      monthlyRental,
      monthlyBillingDate: monthlyDate,
    };

    if (purchaseDate) simData.purchaseDate = new Date(purchaseDate);
    if (simType) simData.simType = simType;
    if (mobileNumber) simData.mobileNumber = mobileNumber;
    if (isSimActivated !== undefined) {
      simData.isSimActivated =
        isSimActivated === true || isSimActivated === "true";
    }
    if (activationDate) simData.activationDate = activationDate;
    if (monthlyData) simData.monthlyData = monthlyData;
    if (simAge) simData.simAge = simAge;
    if (customerOrAlgoEmployeeName)
      simData.customerOrAlgoEmployeeName = customerOrAlgoEmployeeName;
    if (status) simData.status = status;
    if (simData.status === "" || simData.status === null) delete simData.status;

    const newSimMaster = new simMasterModel(simData);
    await newSimMaster.save();

    res.status(201).json({
      success: true,
      message: "Sim Master created successfully",
      simMaster: newSimMaster,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.bulkCreateSimMasters = async (req, res) => {
  try {
    const rawSims = req.body; // Expecting an array of sim objects

    if (!Array.isArray(rawSims) || rawSims.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of SIMs.",
      });
    }

    //console.log(rawSims);

    // Map fields to match the model schema and handle monthlyDate conversion
    const sims = rawSims.map((sim) => ({
      ...sim,
      monthlyBillingDate: sim.monthlyBillingDate || sim.monthlyDate,
      purchaseDate: sim.purchaseDate ? new Date(sim.purchaseDate) : undefined,
      isSimActivated:
        sim.isSimActivated === true ||
        sim.isSimActivated === "true" ||
        sim.isSimActivated === "Yes" ||
        sim.isSimActivated === "yes",
    }));

    // Clean up empty strings for enums
    const cleanedSims = sims.map((sim) => {
      if (sim.status === "" || sim.status === null) {
        const { status, ...rest } = sim;
        return rest;
      }
      return sim;
    });

    const createdSims = await simMasterModel.insertMany(cleanedSims);

    res.status(201).json({
      success: true,
      message: `${createdSims.length} SIMs imported successfully`,
      data: createdSims,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateSimMaster = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sim master ID",
      });
    }

    const { monthlyDate, purchaseDate, isSimActivated, ...otherUpdates } =
      req.body;

    // Start with other updates
    const updates = { ...otherUpdates };

    // Handle special field mappings and conversions
    if (monthlyDate !== undefined) {
      updates.monthlyBillingDate = monthlyDate;
    }

    if (purchaseDate !== undefined) {
      updates.purchaseDate = new Date(purchaseDate);
    }

    if (isSimActivated !== undefined) {
      updates.isSimActivated =
        isSimActivated === true || isSimActivated === "true";
    }

    // Filter out undefined values for performance
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(
        ([_, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    // Only proceed if there are actual updates
    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    const updatedSimMaster = await simMasterModel.findByIdAndUpdate(
      id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    );

    if (!updatedSimMaster) {
      return res.status(404).json({
        success: false,
        message: "Sim Master not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sim Master updated successfully",
      simMaster: updatedSimMaster,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteSimMaster = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sim master ID",
      });
    }

    const deletedSimMaster = await simMasterModel.findByIdAndDelete(id);

    if (!deletedSimMaster) {
      return res.status(404).json({
        success: false,
        message: "Sim Master not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Sim Master deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

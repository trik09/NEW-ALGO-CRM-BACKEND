const accessoryMasterModel = require("../models/accessoryMaster");
const mongoose = require("mongoose");

exports.getAllAccessoryMasters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { search, sortOrder, sortBy } = req.query;

    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { accessoryManufacturer: { $regex: search, $options: "i" } },
          { accessoryType: { $regex: search, $options: "i" } },
          { accessoryModel: { $regex: search, $options: "i" } },
          { accessoryId: { $regex: search, $options: "i" } },
          { invoiceNumber: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ],
      };
    }

    const sortField = sortBy || "createdAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    const accessoryMasters = await accessoryMasterModel
      .find(searchQuery)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit);

    const totalCount = await accessoryMasterModel.countDocuments();

    const totalPages = Math.ceil(totalCount / limit);

    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    res.status(200).json({
      success: true,
      accessoryMasters,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: hasPreviousPage ? page - 1 : null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createAccessoryMasters = async (req, res) => {
  try {
    const {
      accessoryManufacturer,
      accessoryType,
      accessoryModel,
      accessoryId,
      invoiceDate,
      invoiceNumber,
      warrantyPeriod,
      warrantyStatus,
      status,
      customerName,
      age,
    } = req.body;

    const accessoryMaster = await accessoryMasterModel.create({
      accessoryManufacturer,
      accessoryType,
      accessoryModel,
      accessoryId,
      invoiceDate,
      invoiceNumber,
      warrantyPeriod,
      warrantyStatus,
      status,
      customerName,
      age,
    });

    await accessoryMaster.save();

    res.status(201).json({
      success: true,
      message: "Accessory Master created successfully",
      accessoryMaster,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateAccessoryMasters = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid accessory master ID",
      });
    }

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([_, value]) => value !== undefined)
    );

    const updatedAccessoryMaster = await accessoryMasterModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!updatedAccessoryMaster) {
      return res.status(404).json({
        success: false,
        message: "Accessory Master not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Accessory Master updated successfully",
      accessoryMaster: updatedAccessoryMaster,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.deleteAccessoryMasters = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid accessory master ID",
      });
    }

    const deletedAccessoryMaster = await accessoryMasterModel.findByIdAndDelete(
      id
    );

    if (!deletedAccessoryMaster) {
      return res.status(404).json({
        success: false,
        message: "Accessory Master not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Accessory Master deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

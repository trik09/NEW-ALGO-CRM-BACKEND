const DeviceMasterModel = require("../models/deviceMaster");
const mongoose = require("mongoose");

exports.getAllDeviceMasters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, sortBy, sortOrder } = req.query;
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { deviceManufacturer: { $regex: search, $options: "i" } },
          { deviceType: { $regex: search, $options: "i" } },
          { deviceModel: { $regex: search, $options: "i" } },
          { deviceId: { $regex: search, $options: "i" } },
          { invoiceNumber: { $regex: search, $options: "i" } },
          { customerName: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ],
      };
    }

    const totalCount = await DeviceMasterModel.countDocuments(searchQuery);

    const deviceMasters = await DeviceMasterModel.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortOrder });

    const totalPages = Math.ceil(totalCount / limit);

    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    res.status(200).json({
      success: true,
      deviceMasters,
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

exports.createDeviceMasters = async (req, res) => {
  try {
    const data = { ...req.body };

    // Clean up enum fields
    if (data.warrantyStatus === "" || data.warrantyStatus === null)
      delete data.warrantyStatus;
    if (data.status === "" || data.status === null) delete data.status;

    const newDeviceMaster = new DeviceMasterModel(data);

    await newDeviceMaster.save();

    res.status(201).json({
      success: true,
      message: "Device Master created successfully",
      deviceMaster: newDeviceMaster,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.bulkCreateDeviceMasters = async (req, res) => {
  try {
    const rawDevices = req.body; // Expecting an array of device objects

    if (!Array.isArray(rawDevices) || rawDevices.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of devices.",
      });
    }

    // Map fields and handle date conversion if needed
    const devices = rawDevices.map((device) => {
      const d = { ...device };
      if (d.invoiceDate) d.invoiceDate = new Date(d.invoiceDate);

      // Clean up enum fields: if they are empty strings, remove them so they don't trigger validation
      if (d.warrantyStatus === "" || d.warrantyStatus === null)
        delete d.warrantyStatus;
      if (d.status === "" || d.status === null) delete d.status;

      return d;
    });

    // 1. Get existing deviceIds to skip duplicates
    const allDeviceIds = devices.map((d) => d.deviceId).filter(Boolean);

    const existingDevices = await DeviceMasterModel.find(
      {
        deviceId: { $in: allDeviceIds },
      },
      "deviceId"
    );

    const existingDeviceIds = new Set(existingDevices.map((d) => d.deviceId));

    const finalDevicesToInsert = [];
    let duplicateCount = 0;
    const seenDeviceIds = new Set();

    for (const device of devices) {
      if (
        device.deviceId &&
        (existingDeviceIds.has(device.deviceId) ||
          seenDeviceIds.has(device.deviceId))
      ) {
        duplicateCount++;
      } else {
        finalDevicesToInsert.push(device);
        if (device.deviceId) seenDeviceIds.add(device.deviceId);
      }
    }

    let createdDevices = [];
    if (finalDevicesToInsert.length > 0) {
      createdDevices = await DeviceMasterModel.insertMany(finalDevicesToInsert);
    }

    res.status(201).json({
      success: true,
      message: `${createdDevices.length} Devices imported successfully. ${duplicateCount} duplicates skipped.`,
      newCount: createdDevices.length,
      duplicateCount: duplicateCount,
      data: createdDevices,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateDeviceMasters = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device master ID",
      });
    }

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([_, value]) => value !== undefined)
    );

    const updatedDeviceMaster = await DeviceMasterModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedDeviceMaster) {
      return res.status(404).json({
        success: false,
        message: "Device Master not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Device Master updated successfully",
      deviceMaster: updatedDeviceMaster,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteDeviceMasters = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid device master ID",
      });
    }

    const deletedDeviceMaster = await DeviceMasterModel.findByIdAndDelete(id);
    if (!deletedDeviceMaster) {
      return res.status(404).json({
        success: false,
        message: "Device Master not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Device Master deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

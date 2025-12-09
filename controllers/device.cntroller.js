

// controllers/deviceController.js
const Device = require('../models/device.model');
const Employee = require('../models/employee.model')
const Ticket = require('../models/ticket.model')
const mongoose =  require("mongoose")
const dayjs = require("dayjs");
const customerChargeRateListModel = require('../models/customerChargeRateList.model');

// Create single device
const createDevice = async (req, res) => {
  try {
    const { deviceName, deviceCreator } = req.body;

    // Validate inputs
    if (!deviceName || !deviceName.trim()) {
      return res.status(400).json({ success: false, message: 'Device name is required' });
    }

    if (!deviceCreator || !mongoose.Types.ObjectId.isValid(deviceCreator)) {
      return res.status(400).json({ success: false, message: 'Valid device creator ID is required' });
    }

    // Check for duplicates
    const existing = await Device.findOne({ deviceName: deviceName.trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Device with this name already exists' });
    }

    // Save device
    const newDevice = new Device({
      deviceName: deviceName.trim(),
      deviceCreator,
    });

    const savedDevice = await newDevice.save();

    res.status(201).json({
      success: true,
      message: 'Device created successfully',
      data: savedDevice,
    });

  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
// Delete device 
const deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device ID',
      });
    }
    

     const deletedDevice1 = await Device.findById(id);
     

    if (!deletedDevice1) {
      return res.status(404).json({
        success: false,
        message: 'Device not found',
      });
    }


    const dependentTickets = await Ticket.findOne({ 
          deviceType: id, 
          isTicketClosed: false
        });
    
        if (dependentTickets) {
          return res.status(400).json({
            success: false,
            message: "Cannot delete device as it's being used in one or more open tickets",
          });
        }

            // Check for charge rates associated with this device
    const existingChargeRates = await customerChargeRateListModel.findOne({
      device: id
    });

    if (existingChargeRates) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete device as it's being used in one or more charge rates",
      });
    }

    // Find and delete device
    const deletedDevice = await Device.findByIdAndDelete(id);
   
    res.status(200).json({
      success: true,
      message: 'Device deleted successfully',
      data: deletedDevice,
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};
// Update device 

const updateDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const { deviceName } = req.body;

    // Validate device name
    if (!deviceName || !deviceName.trim()) {
      return res.status(400).json({ success: false, message: 'Device name is required' });
    }

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid device ID' });
    }

    // Check if device exists
    const existingDevice = await Device.findById(id);
    if (!existingDevice) {
      return res.status(404).json({ success: false, message: 'Device not found' });
    }

    // Check for duplicate device name (excluding current device)
    const duplicate = await Device.findOne({ 
      deviceName: deviceName.trim(), 
      _id: { $ne: id } 
    });

    if (duplicate) {
      return res.status(409).json({ success: false, message: 'Device name already in use' });
    }

    // Update device name
    existingDevice.deviceName = deviceName.trim();
    const updatedDevice = await existingDevice.save();

    res.status(200).json({
      success: true,
      message: 'Device updated successfully',
      data: updatedDevice,
    });

  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};


// create bulk device in one time 

const createDevicesBulk = async (req, res) => {
  try {
    const { devices, creatorId } = req.body;

    if (!Array.isArray(devices) || devices.length === 0) {
      return res.status(400).json({ error: 'Devices must be a non-empty array.' });
    }

    if (!creatorId) {
      return res.status(400).json({ error: 'Device creator (creatorId) is required.' });
    }

    // Check if creator exists in Employee collection
    const creatorExists = await Employee.findById(creatorId);
    if (!creatorExists) {
      return res.status(404).json({ error: 'Creator (Employee) not found.' });
    }

    // Check for existing devices to avoid duplicates
    const deviceNames = devices.map(d => d.deviceName);
    const existingDevices = await Device.find({ deviceName: { $in: deviceNames } });
    const existingNames = existingDevices.map(d => d.deviceName);

    // Filter devices to insert (skip duplicates)
    const newDevices = devices
      .filter(d => !existingNames.includes(d.deviceName))
      .map(d => ({
        deviceName: d.deviceName,
        deviceCreator: creatorId,
      }));

    if (newDevices.length === 0) {
      return res.status(409).json({ error: 'All devices already exist.' });
    }

    const inserted = await Device.insertMany(newDevices);

    res.status(201).json({
      message: `${inserted.length} device(s) created successfully.`,
      devices: inserted,
    });

  } catch (error) {
    console.error('Error creating devices in bulk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const getAllDevices = async (req, res) => {
  try {
    const search = req.query.search || "";
 
   
    const query = search
      ? { deviceName: { $regex: search, $options: "i" } }
      : {};
  // console.log(query);
    const devices = await Device.find(query).sort({ createdAt: -1 });
    // console.log("devices array", devices);
    res.status(200).json({data:devices,message:'All available devices fetched successfully'});
  } catch (error) {
    console.error('Error getting devices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAllDevicesForTableShow = async (req, res) => {
  try {
    // Extract query parameters from frontend
    const { 
      search = "",
      page = 1, 
      limit = 10,
      sort = "createdAt",
      order = "desc"
    } = req.query;

    // Calculate pagination values
    const skip = (page - 1) * limit;
    
    // Build the query for search
    const query = {};
    if (search) {
      query.deviceName = { $regex: search, $options: "i" };
    }

    // Get total count of devices (for pagination)
    const total = await Device.countDocuments(query);
  
    // Fetch devices with pagination and sorting
    const devices = await Device.find(query)
      .populate('deviceCreator', 'name email') // Only populate name and email
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();
// console.log("devices array", devices1);
    // Format the response exactly as frontend expects
    const response = {
      success: true,
      data: devices.map(device => ({
        _id: device._id,
        deviceName: device.deviceName,
        deviceCreator: device.deviceCreator 
          ? {
              _id: device.deviceCreator._id,
              name: device.deviceCreator.name,
              email: device.deviceCreator.email
            } 
          : null,
        createdAt: device.createdAt,
        updatedAt: device.updatedAt
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'All available devices fetched successfully'
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error getting devices:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch devices'
    });
  }
};




//   try {
//     const { fromDate, toDate, search } = req.query;

//     if (!fromDate || !toDate) {
//       return res.status(400).json({
//         success: false,
//         message: "fromDate and toDate are required",
//       });
//     }

//     const from = dayjs(fromDate).startOf("day").toDate();
//     const to = dayjs(toDate).endOf("day").toDate();

//     const query = {
//       createdAt: { $gte: from, $lte: to },
//     };

//     if (search) {
//       query.deviceName = { $regex: search, $options: "i" };
//     }

//     const devices = await Device.find(query).sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: devices.length,
//       message: "Filtered devices fetched successfully",
//       data: devices,
//     });
//   } catch (error) {
//     console.error("Error exporting devices:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
const exportDevices = async (req, res) => {
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

    const devices = await Device.find({
      createdAt: {
        $gte: from,
        $lte: to,
      },
    })
      .populate("deviceCreator", "name email") // 👈 this is the fix
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: devices.length,
      message: "Filtered devices fetched successfully",
      data: devices,
    });
  } catch (error) {
    console.error("Error exporting devices:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



module.exports = { createDevice,createDevicesBulk,getAllDevices ,deleteDevice,updateDevice,getAllDevicesForTableShow
  ,exportDevices
};

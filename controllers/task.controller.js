const Task = require("../models/task.model");
const Ticket = require("../models/ticket.model");
const mongoose = require("mongoose");
const dayjs = require("dayjs");

const Device = require('../models/device.model');
const CustomerChargeRate = require('../models/customerChargeRateList.model');

const QstClient = require("../models/qstClient.model");
const customerChargeRateListModel = require("../models/customerChargeRateList.model");


exports.createTask = async (req, res) => {
  try {
    // Validate task name
    if (!req.body.taskName || req.body.taskName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Task name is required",
      });
    }

    // Utility function to normalize strings
function normalizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, '-').toLowerCase();
}


    // Validate taskCreator if provided
    if (req.body?.taskCreator) {
      if (!mongoose.Types.ObjectId.isValid(req.body.taskCreator)) {
        return res.status(400).json({
          success: false,
          message: "Valid task creator ID is required",
        });
      }
    }

    // Normalize and trim taskName
    const normalizedTaskName = normalizeString(req.body.taskName);

    // Trim description (optional)
    const trimmedDescription = req.body.description
      ? req.body.description.trim()
      : "";

    // Create and save the task
    const task = new Task({
      taskName: normalizedTaskName,
    });

    const savedTask = await task.save();

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: savedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating task",
      error: error.message,
    });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build search query
    const query = search
      ? { taskName: { $regex: search, $options: "i" } }
      : {};

    // Get total count for pagination
    const total = await Task.countDocuments(query);

    // Get paginated results
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};

exports.exportTaskTypes = async (req, res) => {
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

    const tasks = await Task.find({
      createdAt: { $gte: from, $lte: to },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error exporting task types",
      error: error.message,
    });
  }
};
// Get task by ID
exports.getTaskById = async (req, res) => {

  const taskId = req.params.id;
  if (!taskId) {
    return res.status(400).json({
      success: false,
      message: "Task ID is required"
    });
  }
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.status(200).json({
      success: true,
       message: "Task found successfuly",
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching task",
      error: error.message
    });
  }
};

 exports.createTasksBulk = async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ error: 'Tasks must be a non-empty array.' });
    }

    // Optional: remove tasks without taskName
    const filteredTasks = tasks
      .filter(task => task.taskName && typeof task.taskName === 'string')
      .map(task => ({ taskName: task.taskName.trim() }));

    if (filteredTasks.length === 0) {
      return res.status(400).json({ error: 'All tasks are invalid or missing taskName.' });
    }

    // Optional: remove duplicates (by taskName)
    const existingTaskNames = await Task.find({
      taskName: { $in: filteredTasks.map(t => t.taskName) }
    }).distinct('taskName');

    const newTasks = filteredTasks.filter(t => !existingTaskNames.includes(t.taskName));

    if (newTasks.length === 0) {
      return res.status(409).json({ message: 'All provided tasks already exist.' });
    }

    const savedTasks = await Task.insertMany(newTasks);

    res.status(201).json({
      message: `${savedTasks.length} task(s) created successfully.`,
      tasks: savedTasks
    });

  } catch (error) {
    console.error('Error creating tasks in bulk:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskName } = req.body;

    // Validate input taskName
    if (!taskName || typeof taskName !== 'string' || taskName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Task name is required",
      });
    }

    // Utility to normalize string
function normalizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, '-').toLowerCase();
}


    const normalizedTaskName = normalizeString(taskName);

    // Check for existing task with same normalized name (excluding current one)
    const existingTask = await Task.findOne({
      taskName: normalizedTaskName,
      _id: { $ne: id }
    });

    if (existingTask) {
      return res.status(409).json({
        success: false,
        message: "Another task with this name already exists",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { taskName: normalizedTaskName },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating task",
      error: error.message,
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // First find the task to check its type
    const taskToDelete = await Task.findById(id);

    if (!taskToDelete) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if task type is protected (cannot be deleted)
    

     const protectedTaskNames = ["Reinstallation", "Installation", "Service"];
    const isProtected = protectedTaskNames.some(
      (name) => name.toLowerCase() === taskToDelete.taskName.toLowerCase()
    );

    if (isProtected) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete protected task: ${taskToDelete.taskName}`,
      });
    }

    // Check if any tickets reference this task
    const dependentTickets = await Ticket.findOne({ 
      taskType: id, 
      isTicketClosed: false
    });

    if (dependentTickets) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete task as it's being used in one or more open tickets",
      });
    }


        // Check if any charge rates reference this task (it means any charge rate is linked to this task)
    const existingChargeRates = await customerChargeRateListModel.findOne({
      taskType: id
    });

    if (existingChargeRates) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete task as it's being used in one or more charge rates",
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      deletedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting task",
      error: error.message,
    });
  }
};


exports.getAllTaskForCustomerRateChart =  async (req, res) => {
  try {

    // Fetch all tasks (optionally filtered)
    const tasks = await Task.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tasks for customer rate chart",
      error: error.message
    });
  }
}








// 👇========================------ rate chart db function to feed db in rate chart it only used first time ================================================= 






// Device pricing mappings================================
// gps panic 1-------------------------------
// const devicePriceMappings = {
//   'service': 400,
//   'device collection': 0,
//   'reinstallation': 750,
//   'removal': 400,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 450,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };



// // gps rfid --------------------------------
// const devicePriceMappings = {
//   'service': 500,
//   'device collection': 0,
//   'reinstallation': 1300,
//   'removal': 500,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 700,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };



// // gps can realy  --------------------------------
// const devicePriceMappings = {
//   'service': 500,
//   'device collection': 0,
//   'reinstallation': 950,
//   'removal': 500,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 650,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };


// // GPS + CAN + Relay + Panic 1  --------------------------------
// const devicePriceMappings = {
//   'service': 500,
//   'device collection': 0,
//   'reinstallation': 950,
//   'removal': 500,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 650,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };


// //GPS + CAN + Relay + Panic 1 + KLE  --------------------------------
// const devicePriceMappings = {
//   'service': 600,
//   'device collection': 0,
//   'reinstallation': 1100,
//   'removal': 600,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 900,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };

// //'GPS + Relay  --------------------------------
// const devicePriceMappings = {
//   'service': 400,
//   'device collection': 0,
//   'reinstallation': 850,
//   'removal': 400,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 550,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };



// // GPS + Fuel-----------------------------
// const devicePriceMappings = {
//   'service': 500,
//   'device collection': 0,
//   'reinstallation': 3500,
//   'removal': 500,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 2500,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };


// //GPS + 1 Temp sensor - Vehicle
// const devicePriceMappings = {
//   'service': 500,
//   'device collection': 0,
//   'reinstallation': 1350,
//   'removal': 500,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 700,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };



// GPS + 2 Temp sensor - Vehicle

// const devicePriceMappings = {
//   'service': 600,
//   'device collection': 0,
//   'reinstallation': 1500,
//   'removal': 600,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 900,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };


// //GPS + 1 Temp Sensor - Cold storage

// const devicePriceMappings = {
//   'service': 500,
//   'device collection': 0,
//   'reinstallation': 1000,
//   'removal': 500,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 750,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };



// //GPS + 2 Temp Sensor - Cold storage

// const devicePriceMappings = {
//   'service': 600,
//   'device collection': 0,
//   'reinstallation': 1200,
//   'removal': 600,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 900,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };


//Vmeasure machine

// const devicePriceMappings = {
//   'service': 500,
//   'device collection': 0,
//   'reinstallation': 0,
//   'removal': 500,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 1300,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };


//Dashcam wired - front

// const devicePriceMappings = {
//   'service': 500,
//   'device collection': 0,
//   'reinstallation': 1100,
//   'removal': 500,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 600,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };




// //Dashcam usb - front

// const devicePriceMappings = {
//   'service': 500,
//   'device collection': 0,
//   'reinstallation': 1000,
//   'removal': 500,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 575,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };

// // Dashcam wired - front + rear

// const devicePriceMappings = {
//   'service': 650,
//   'device collection': 0,
//   'reinstallation': 1450,
//   'removal': 650,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 850,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };


// //Dashcam usb - front + rear

// const devicePriceMappings = {
//   'service': 650,
//   'device collection': 0,
//   'reinstallation': 1350,
//   'removal': 650,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 825,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };


// //Dashcam + 3 external cameras ⚠️

// const devicePriceMappings = {
//   'service': 650,
//   'device collection': 0,
//   'reinstallation': 0,
//   'removal': 650,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 1300,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };

// //CCTV - DVR, Hard disk + Cameras 2
// const devicePriceMappings = {
//   'service': 750,
//   'device collection': 0,
//   'reinstallation': 2200,
//   'removal': 750,
//   'courier': 0,
//   'installation': { // Changed to object for quantity tiers
//     '1_10': 1200,
//     '11_20': 0,
//     '21_25': 0,
//     '26_30': 0,
//     '31_40': 0,
//     '41_50': 0,
//     '51_plus': 0
//   }
// };


const devicePriceMappings = {
  'service': 400,
  'device collection': 0,
  'reinstallation': 750,
  'removal': 400,
  'courier': 0,
  'installation': { // Changed to object for quantity tiers
    '1_10': 450,
    '11_20': 0,
    '21_25': 0,
    '26_30': 0,
    '31_40': 0,
    '41_50': 0,
    '51_plus': 0
  }
};


const excludedClients = [
  'Varroc',
  'Arya Omnitalk', 
  'Covert Eye',
  'Tata Motors',
  'Dylect',
  'CP Plus',
  'Ecofy'
].map(client => client?.toLowerCase());

exports.updateDeviceRatesWithInstallationCheck = async (req, res) => {
  try {
    const deviceId = "68469f80bd99f46654160b69";
    
    // 1. Verify device exists
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    
    console.log('Processing device:', device.deviceName);

    // 2. Get all task types
    const taskTypes = await Task.find();
    if (!taskTypes.length) {
      return res.status(404).json({
        success: false,
        message: 'No task types found'
      });
    }
    console.log('Available task types:', taskTypes.map(t => t.taskName));
    // 3. Get filtered clients
    const allClients = await QstClient.find().select('-__v');
    const filteredClients = allClients.filter(client => {
      const clientName = (client.companyShortName || '')?.toLowerCase();
      return !excludedClients.includes(clientName);
    });
  console.log(filteredClients.length, "filteredClients");
    // 4. Process rates
    const results = [];
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

 for (const client of filteredClients) {
      for (const taskType of taskTypes) {
        const taskTypeName = taskType.taskName?.toLowerCase()?.trim();
        const isInstallation = taskTypeName === 'installation';
        const isReinstallation = taskTypeName === 'reinstallation'; // Separate check if needed
          // Find matching price key (case insensitive)
        const priceKey = Object.keys(devicePriceMappings).find(key => 
          taskTypeName?.includes(key.toLowerCase())
        );

        // Skip if no pricing defined
        if (!priceKey) {
          skippedCount++;
          results.push({
            client: client.companyShortName,
            taskType: taskType.taskName,
            status: 'skipped (no pricing defined)'
          });
          continue;
        }

        // Prepare rate data
         const rateData = {
          qstClient: client._id,
          device: deviceId,
          taskType: taskType._id,
          isQuantityBased: isInstallation
        };

        // Set pricing based on task type
         if (isInstallation) {
          rateData.rates = {
            quantity_1_10: devicePriceMappings.installation['1_10'],
            quantity_11_20: devicePriceMappings.installation['11_20'],
            quantity_21_25: devicePriceMappings.installation['21_25'],
            quantity_26_30: devicePriceMappings.installation['26_30'],
            quantity_31_40: devicePriceMappings.installation['31_40'],
            quantity_41_50: devicePriceMappings.installation['41_50'],
            quantity_51_plus: devicePriceMappings.installation['51_plus']
          };
        } else {
          rateData.flatRate = devicePriceMappings[priceKey];
        }

        // Update or create record
        const result = await CustomerChargeRate.findOneAndUpdate(
          {
            qstClient: client._id,
            device: deviceId,
            taskType: taskType._id
          },
          rateData,
          {
            new: true,
            upsert: true,
            runValidators: true
          }
        );

        if (result.isNew) {
          createdCount++;
          results.push({
            client: client.companyShortName,
            taskType: taskTypeName,
            status: 'created',
            rateId: result._id,
            pricingType: isInstallation ? 'quantity-based' : 'flat-rate'
          });
        } else {
          updatedCount++;
          results.push({
            client: client.companyShortName,
            taskType: taskTypeName,
            status: 'updated',
            rateId: result._id,
            pricingType: isInstallation ? 'quantity-based' : 'flat-rate'
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Device rates processing completed',
      summary: {
        totalClients: filteredClients.length,
        totalTaskTypes: taskTypes.length,
        ratesCreated: createdCount,
        ratesUpdated: updatedCount,
        ratesSkipped: skippedCount,
        installationRatesApplied: taskTypes.filter(t => 
          t.name?.toLowerCase().includes('installation')).length
      },
      deviceInfo: {
        id: deviceId,
        name: device.deviceName,
        creator: device.deviceCreator
      }
    });

  } catch (error) {
    console.error('Error in updateDeviceRatesWithInstallationCheck:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing device rates',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
      })
    });
  }
};
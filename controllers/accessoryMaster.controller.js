const accessoryMasterModel = require("../models/accessoryMaster");
const mongoose = require("mongoose");
const { computeWarrantyStatus } = require("../utils/warrantyUtils");
const { isDemoExpiringSoon } = require("../utils/demoPeriodChecker");

// exports.getAllAccessoryMasters = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;
//     const skip = (page - 1) * limit;

//     const { search, sortOrder, sortBy } = req.query;

//     let searchQuery = {};
//     if (search) {
//       searchQuery = {
//         $or: [
//           { accessoryManufacturer: { $regex: search, $options: "i" } },
//           { accessoryType: { $regex: search, $options: "i" } },
//           { accessoryModel: { $regex: search, $options: "i" } },
//           { accessoryId: { $regex: search, $options: "i" } },
//           { invoiceNumber: { $regex: search, $options: "i" } },
//           { status: { $regex: search, $options: "i" } },
//         ],
//       };
//     }

//     const sortField = sortBy || "createdAt";
//     const sortDirection = sortOrder === "asc" ? 1 : -1;

//     const accessoryMasters = await accessoryMasterModel
//       .find(searchQuery)
//       .sort({ [sortField]: sortDirection })
//       .skip(skip)
//       .limit(limit);

//     const totalCount = await accessoryMasterModel.countDocuments(searchQuery);

//     const totalPages = Math.ceil(totalCount / limit);

//     const hasNextPage = page < totalPages;
//     const hasPreviousPage = page > 1;
//     res.status(200).json({
//       success: true,
//       accessoryMasters,
//       totalPages,
//       hasNextPage,
//       hasPreviousPage,
//       nextPage: hasNextPage ? page + 1 : null,
//       previousPage: hasPreviousPage ? page - 1 : null,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.createAccessoryMasters = async (req, res) => {
//   try {
//     const {
//       accessoryManufacturer,
//       accessoryType,
//       accessoryModel,
//       accessoryId,
//       invoiceDate,
//       invoiceNumber,
//       warrantyPeriod,
//       warrantyStatus,
//       status,
//       customerName,
//       age,
//     } = req.body;

//     const accessoryMaster = await accessoryMasterModel.create({
//       accessoryManufacturer,
//       accessoryType,
//       accessoryModel,
//       accessoryId,
//       invoiceDate,
//       invoiceNumber,
//       warrantyPeriod,
//       warnatyStatus: warrantyStatus,
//       status,
//       customerName,
//       Age: age,
//     });

//     await accessoryMaster.save();

//     res.status(201).json({
//       success: true,
//       message: "Accessory Master created successfully",
//       accessoryMaster,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.getAllAccessoryMasters = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 20;
//     const skip = (page - 1) * limit;

//     const { search, sortOrder, sortBy } = req.query;

//     let searchQuery = {};
//     if (search) {
//       searchQuery = {
//         $or: [
//           { accessoryManufacturer: { $regex: search, $options: "i" } },
//           { accessoryType: { $regex: search, $options: "i" } },
//           { accessoryModel: { $regex: search, $options: "i" } },
//           { accessoryId: { $regex: search, $options: "i" } },
//           { invoiceNumber: { $regex: search, $options: "i" } },
//           { status: { $regex: search, $options: "i" } },
//         ],
//       };
//     }

//     const sortField = sortBy || "createdAt";
//     const sortDirection = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;

//     const totalCount = await accessoryMasterModel.countDocuments(searchQuery);

//     const accessoryMastersRaw = await accessoryMasterModel
//       .find(searchQuery)
//       .sort({ [sortField]: sortDirection })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     const MS_PER_DAY = 1000 * 60 * 60 * 24;
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const accessoryMasters = accessoryMastersRaw.map((a) => {
//       // stock days
//       let daysInStock = null;
//       if (a.status === "stock") {
//         const start = a.stockEnteredAt || a.createdAt;
//         daysInStock = start
//           ? Math.floor((Date.now() - new Date(start).getTime()) / MS_PER_DAY)
//           : 0;
//         if (daysInStock < 0) daysInStock = 0;
//       }

//       // demo badges
//       let demoDaysLeft = null;
//       let demoAlert = false;
//       let demoExpired = false;

//       if (a.status === "customer demo" && a.demoToDate) {
//         const end = new Date(a.demoToDate);
//         end.setHours(0, 0, 0, 0);

//         demoDaysLeft = Math.ceil((end - today) / MS_PER_DAY);
//         demoExpired = demoDaysLeft < 0;
//         demoAlert = isDemoExpiringSoon(a.demoToDate, 2); // today/1/2 days
//       }

//       return { ...a, daysInStock, demoDaysLeft, demoAlert, demoExpired };
//     });

//     const totalPages = Math.ceil(totalCount / limit);

//     res.status(200).json({
//       success: true,
//       accessoryMasters,
//       totalPages,
//       hasNextPage: page < totalPages,
//       hasPreviousPage: page > 1,
//       nextPage: page < totalPages ? page + 1 : null,
//       previousPage: page > 1 ? page - 1 : null,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.createAccessoryMasters = async (req, res) => {
//   try {
//     const data = { ...req.body };

//     // ✅ never accept warrantyStatus from frontend
//     delete data.warrantyStatus;
//     delete data.warnatyStatus;

//     // ✅ status default
//     const finalStatus = data.status || "stock";

//     // ✅ demo rule
//     if (finalStatus === "customer demo") {
//       if (!data.demoFromDate || !data.demoToDate) {
//         return res.status(400).json({
//           success: false,
//           message: "demoFromDate and demoToDate are required when status is customer demo",
//         });
//       }

//       const from = new Date(data.demoFromDate);
//       const to = new Date(data.demoToDate);

//       if (isNaN(from.getTime()) || isNaN(to.getTime())) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid demoFromDate or demoToDate",
//         });
//       }

//       if (to < from) {
//         return res.status(400).json({
//           success: false,
//           message: "demoToDate cannot be earlier than demoFromDate",
//         });
//       }
//     } else {
//       data.demoFromDate = null;
//       data.demoToDate = null;
//     }

//     // ✅ ALWAYS auto-calc warranty
//     const autoWarranty = computeWarrantyStatus(data.invoiceDate, data.warrantyPeriod);
//     if (autoWarranty) data.warnatyStatus = autoWarranty;

//     const accessoryMaster = new accessoryMasterModel({
//       ...data,
//       status: finalStatus,
//       stockEnteredAt: finalStatus === "stock" ? new Date() : undefined,
//       statusHistory: [
//         {
//           status: finalStatus,
//           changedAt: new Date(),
//           changedBy: req.user?.name || req.user?.email || "system",
//         },
//       ],
//     });

//     await accessoryMaster.save();

//     res.status(201).json({
//       success: true,
//       message: "Accessory Master created successfully",
//       accessoryMaster,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

exports.getAllAccessoryMasters = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
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
    const sortDirection = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;

    const totalCount = await accessoryMasterModel.countDocuments(searchQuery);

    // ✅ populate assignedTo using refPath (assignedToModel)
    const accessoryMastersRaw = await accessoryMasterModel
      .find(searchQuery)
      .populate({
        path: "assignedTo",
        select: "name companyName", // Technician/Employee -> name, QstClient -> companyName
      })
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean();

    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const accessoryMasters = accessoryMastersRaw.map((a) => {
      // ✅ assign name (works for any model)
      const assignedToName =
        a?.assignedTo?.companyName || a?.assignedTo?.name || null;

      // stock days
      let daysInStock = null;
      if (a.status === "stock") {
        const start = a.stockEnteredAt || a.createdAt;
        daysInStock = start
          ? Math.floor((Date.now() - new Date(start).getTime()) / MS_PER_DAY)
          : 0;
        if (daysInStock < 0) daysInStock = 0;
      }

      // demo badges
      let demoDaysLeft = null;
      let demoAlert = false;
      let demoExpired = false;

      if (a.status === "customer demo" && a.demoToDate) {
        const end = new Date(a.demoToDate);
        end.setHours(0, 0, 0, 0);

        demoDaysLeft = Math.ceil((end - today) / MS_PER_DAY);
        demoExpired = demoDaysLeft < 0;
        demoAlert = isDemoExpiringSoon(a.demoToDate, 2); // today/1/2
      }

      return {
        ...a,
        assignedToName, // ✅ add simple field for frontend
        daysInStock,
        demoDaysLeft,
        demoAlert,
        demoExpired,
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      accessoryMasters,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAccessoryMasters = async (req, res) => {
  try {
    const data = { ...req.body };

    // ✅ never accept warrantyStatus from frontend
    delete data.warrantyStatus;
    delete data.warnatyStatus;

    const finalStatus = data.status || "stock";

    // ✅ mapping status -> model
    const STATUS_OWNER_RULES = {
      "with technician": "Technician",
      "with cse": "Employee",
      "sold to customer": "QstClient",
      "customer demo": "QstClient",
      foc: "QstClient",
    };

    // ✅ If status requires owner, validate assignedTo and set assignedToModel automatically
    const requiredModel = STATUS_OWNER_RULES[finalStatus];

    if (requiredModel) {
      if (
        !data.assignedTo ||
        !mongoose.Types.ObjectId.isValid(data.assignedTo)
      ) {
        return res.status(400).json({
          success: false,
          message: `assignedTo is required and must be a valid ObjectId when status is "${finalStatus}"`,
        });
      }
      data.assignedToModel = requiredModel;
    } else {
      data.assignedTo = null;
      data.assignedToModel = null;
    }

    // ✅ demo rule
    if (finalStatus === "customer demo") {
      if (!data.demoFromDate || !data.demoToDate) {
        return res.status(400).json({
          success: false,
          message:
            "demoFromDate and demoToDate are required when status is customer demo",
        });
      }

      const from = new Date(data.demoFromDate);
      const to = new Date(data.demoToDate);

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid demoFromDate or demoToDate",
        });
      }

      if (to < from) {
        return res.status(400).json({
          success: false,
          message: "demoToDate cannot be earlier than demoFromDate",
        });
      }
    } else {
      data.demoFromDate = null;
      data.demoToDate = null;
    }

    // ✅ ALWAYS auto-calc warranty
    const autoWarranty = computeWarrantyStatus(
      data.invoiceDate,
      data.warrantyPeriod,
    );
    if (autoWarranty) data.warnatyStatus = autoWarranty;

    const accessoryMaster = new accessoryMasterModel({
      ...data,
      status: finalStatus,
      stockEnteredAt: finalStatus === "stock" ? new Date() : undefined,
      statusHistory: [
        {
          status: finalStatus,
          changedAt: new Date(),
          changedBy: req.user?.name || req.user?.email || "system",
        },
      ],
    });

    await accessoryMaster.save();

    res.status(201).json({
      success: true,
      message: "Accessory Master created successfully",
      accessoryMaster,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkCreateAccessoryMasters = async (req, res) => {
  try {
    const rawAccessories = req.body; // Expecting an array of accessory objects

    if (!Array.isArray(rawAccessories) || rawAccessories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of accessories.",
      });
    }

    // Map fields to match the model schema (Age and warnatyStatus)
    const accessories = rawAccessories.map((acc) => ({
      ...acc,
      Age: acc.Age || acc.age,
      warnatyStatus: acc.warnatyStatus || acc.warrantyStatus,
    }));

    // 1. Get existing accessoryIds to skip duplicates
    const allAccessoryIds = accessories
      .map((a) => a.accessoryId)
      .filter(Boolean);

    const existingAccessories = await accessoryMasterModel.find(
      {
        accessoryId: { $in: allAccessoryIds },
      },
      "accessoryId",
    );

    const existingAccessoryIds = new Set(
      existingAccessories.map((a) => a.accessoryId),
    );

    const finalAccessoriesToInsert = [];
    let duplicateCount = 0;
    const seenAccessoryIds = new Set();

    for (const acc of accessories) {
      if (
        acc.accessoryId &&
        (existingAccessoryIds.has(acc.accessoryId) ||
          seenAccessoryIds.has(acc.accessoryId))
      ) {
        duplicateCount++;
      } else {
        finalAccessoriesToInsert.push(acc);
        if (acc.accessoryId) seenAccessoryIds.add(acc.accessoryId);
      }
    }

    let createdAccessories = [];
    if (finalAccessoriesToInsert.length > 0) {
      createdAccessories = await accessoryMasterModel.insertMany(
        finalAccessoriesToInsert,
      );
    }

    res.status(201).json({
      success: true,
      message: `${createdAccessories.length} Accessories imported successfully. ${duplicateCount} duplicates skipped.`,
      newCount: createdAccessories.length,
      duplicateCount: duplicateCount,
      data: createdAccessories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// exports.updateAccessoryMasters = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid accessory master ID",
//       });
//     }

//     const updates = { ...req.body };
//     if (updates.age !== undefined) {
//       updates.Age = updates.age;
//       delete updates.age;
//     }
//     if (updates.warrantyStatus !== undefined) {
//       updates.warnatyStatus = updates.warrantyStatus;
//       delete updates.warrantyStatus;
//     }

//     const updatedAccessoryMaster = await accessoryMasterModel.findByIdAndUpdate(
//       id,
//       { $set: updates },
//       { new: true }
//     );

//     if (!updatedAccessoryMaster) {
//       return res.status(404).json({
//         success: false,
//         message: "Accessory Master not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Accessory Master updated successfully",
//       accessoryMaster: updatedAccessoryMaster,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// exports.updateAccessoryMasters = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid accessory master ID",
//       });
//     }

//     const accessory = await accessoryMasterModel.findById(id);
//     if (!accessory) {
//       return res.status(404).json({
//         success: false,
//         message: "Accessory Master not found",
//       });
//     }

//     const updates = Object.fromEntries(
//       Object.entries(req.body).filter(([_, value]) => value !== undefined)
//     );

//     // age mapping
//     if (updates.age !== undefined) {
//       updates.Age = updates.age;
//       delete updates.age;
//     }

//     // ✅ never accept warrantyStatus from frontend
//     delete updates.warrantyStatus;
//     delete updates.warnatyStatus;

//     if (updates.status === "" || updates.status === null) delete updates.status;

//     const incomingStatus = updates.status;
//     const prevStatus = accessory.status;

//     delete updates.status;
//     Object.assign(accessory, updates);

//     // ✅ demo rules
//     if (incomingStatus === "customer demo") {
//       if (!accessory.demoFromDate || !accessory.demoToDate) {
//         return res.status(400).json({
//           success: false,
//           message: "demoFromDate and demoToDate are required for customer demo",
//         });
//       }

//       const from = new Date(accessory.demoFromDate);
//       const to = new Date(accessory.demoToDate);

//       if (isNaN(from.getTime()) || isNaN(to.getTime())) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid demoFromDate or demoToDate",
//         });
//       }

//       if (to < from) {
//         return res.status(400).json({
//           success: false,
//           message: "demoToDate cannot be earlier than demoFromDate",
//         });
//       }
//     }

//     if (incomingStatus && incomingStatus !== "customer demo") {
//       accessory.demoFromDate = null;
//       accessory.demoToDate = null;
//     }

//     // ✅ ALWAYS auto-calc warranty
//     const autoWarranty = computeWarrantyStatus(accessory.invoiceDate, accessory.warrantyPeriod);
//     if (autoWarranty) accessory.warnatyStatus = autoWarranty;

//     // ✅ status change + history
//     if (incomingStatus && incomingStatus !== prevStatus) {
//       accessory.status = incomingStatus;

//       accessory.statusHistory = accessory.statusHistory || [];
//       accessory.statusHistory.push({
//         status: incomingStatus,
//         changedAt: new Date(),
//         changedBy: req.user?.name || req.user?.email || "system",
//       });

//       if (incomingStatus === "stock") {
//         accessory.stockEnteredAt = new Date();
//       }
//     }

//     const updatedAccessoryMaster = await accessory.save();

//     res.status(200).json({
//       success: true,
//       message: "Accessory Master updated successfully",
//       accessoryMaster: updatedAccessoryMaster,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

exports.updateAccessoryMasters = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid accessory master ID",
      });
    }

    const accessory = await accessoryMasterModel.findById(id);
    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: "Accessory Master not found",
      });
    }

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([_, value]) => value !== undefined),
    );

    // age mapping
    if (updates.age !== undefined) {
      updates.Age = updates.age;
      delete updates.age;
    }

    // ✅ never accept warrantyStatus from frontend
    delete updates.warrantyStatus;
    delete updates.warnatyStatus;

    if (updates.status === "" || updates.status === null) delete updates.status;

    const incomingStatus = updates.status;
    const prevStatus = accessory.status;

    delete updates.status;
    Object.assign(accessory, updates);

    // ✅ mapping status -> model
    const STATUS_OWNER_RULES = {
      "with technician": "Technician",
      "with cse": "Employee",
      "sold to customer": "QstClient",
      "customer demo": "QstClient",
      foc: "QstClient",
    };

    // ✅ assignment rules ONLY if status is being updated
    if (incomingStatus) {
      const requiredModel = STATUS_OWNER_RULES[incomingStatus];

      if (requiredModel) {
        const assignedToId = req.body.assignedTo; // must come in request when changing to these statuses

        if (!assignedToId || !mongoose.Types.ObjectId.isValid(assignedToId)) {
          return res.status(400).json({
            success: false,
            message: `assignedTo is required and must be a valid ObjectId when status is "${incomingStatus}"`,
          });
        }

        accessory.assignedTo = assignedToId;
        accessory.assignedToModel = requiredModel;
      } else {
        accessory.assignedTo = null;
        accessory.assignedToModel = null;
      }
    }

    // ✅ demo rules
    if (incomingStatus === "customer demo") {
      if (!accessory.demoFromDate || !accessory.demoToDate) {
        return res.status(400).json({
          success: false,
          message: "demoFromDate and demoToDate are required for customer demo",
        });
      }

      const from = new Date(accessory.demoFromDate);
      const to = new Date(accessory.demoToDate);

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid demoFromDate or demoToDate",
        });
      }

      if (to < from) {
        return res.status(400).json({
          success: false,
          message: "demoToDate cannot be earlier than demoFromDate",
        });
      }
    }

    if (incomingStatus && incomingStatus !== "customer demo") {
      accessory.demoFromDate = null;
      accessory.demoToDate = null;
    }

    // ✅ ALWAYS auto-calc warranty
    const autoWarranty = computeWarrantyStatus(
      accessory.invoiceDate,
      accessory.warrantyPeriod,
    );
    if (autoWarranty) accessory.warnatyStatus = autoWarranty;

    // ✅ status change + history
    if (incomingStatus && incomingStatus !== prevStatus) {
      accessory.status = incomingStatus;

      accessory.statusHistory = accessory.statusHistory || [];
      accessory.statusHistory.push({
        status: incomingStatus,
        changedAt: new Date(),
        changedBy: req.user?.name || req.user?.email || "system",
      });

      if (incomingStatus === "stock") {
        accessory.stockEnteredAt = new Date();
      }
    }

    const updatedAccessoryMaster = await accessory.save();

    res.status(200).json({
      success: true,
      message: "Accessory Master updated successfully",
      accessoryMaster: updatedAccessoryMaster,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
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

    const deletedAccessoryMaster =
      await accessoryMasterModel.findByIdAndDelete(id);

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

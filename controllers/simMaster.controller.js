const mongoose = require("mongoose");
const simMasterModel = require("../models/simMaster");
const { pushStatusHistory, isDemoExpiringSoon } = require("../utils/helperForSimMaster");

function getAssignedToModelFromStatus(status) {
  if (status === "with technician") return "Technician";
  if (status === "with cse") return "Employee";
  if (status === "sold to customer" || status === "customer demo") return "QstClient";
  return null;
} 

function normalizeDateInputToISODateString(val) {
  if (!val) return "";

  // already ISO date
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;

  // handle "DD/MM/YYYY"
  if (typeof val === "string" && val.includes("/")) {
    const [dd, mm, yyyy] = val.split("/");
    if (dd && mm && yyyy) return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  }

  // handle date object / other string
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function applyActivationAuto(simDocOrData) {
  // if activationDate exists => isSimActivated must be true
  const act = normalizeDateInputToISODateString(simDocOrData.activationDate);
  if (act) {
    simDocOrData.activationDate = act;     // store as "YYYY-MM-DD"
    simDocOrData.isSimActivated = true;
  } else {
    // if no activationDate and isSimActivated false => clear activationDate
    if (simDocOrData.isSimActivated === false) {
      simDocOrData.activationDate = "";
    }
  }
}

exports.createSimMaster = async (req, res) => {
  try {
    const data = { ...req.body };

    // ✅ clean empties
    if (data.status === "" || data.status === null) delete data.status;
    if (data.assignedTo === "" || data.assignedTo === null) delete data.assignedTo;
    if (data.assignedToName === "" || data.assignedToName === null) delete data.assignedToName;
    if (data.assignedToModel === "" || data.assignedToModel === null) delete data.assignedToModel;

    // ✅ unique simNumber check
    if (data.simNumber !== undefined) {
      const existingSim = await simMasterModel.findOne({ simNumber: data.simNumber });
      if (existingSim) {
        return res.status(400).json({ success: false, message: "SIM number already exists" });
      }
    }

    // ✅ monthlyDate mapping
    if (data.monthlyDate !== undefined) {
      data.monthlyBillingDate = data.monthlyDate;
      delete data.monthlyDate;
    }

    // ✅ purchaseDate parse
    if (data.purchaseDate) {
      const d = new Date(data.purchaseDate);
      if (!isNaN(d.getTime())) data.purchaseDate = d;
      else delete data.purchaseDate;
    }

    // ✅ normalize activationDate (store as YYYY-MM-DD string)
    if (data.activationDate !== undefined) {
      if (!data.activationDate) {
        data.activationDate = "";
      } else if (typeof data.activationDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.activationDate)) {
        // ok
      } else {
        const d = new Date(data.activationDate);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          data.activationDate = `${yyyy}-${mm}-${dd}`;
        } else {
          data.activationDate = "";
        }
      }
    }

    // ✅ isSimActivated auto (activationDate wins)
    data.isSimActivated = Boolean(data.activationDate);

    const finalStatus = data.status || "stock";

    // ✅ assignment validation based on status
    const needsAssignedTo = ["with technician", "with cse", "sold to customer", "customer demo"].includes(finalStatus);

    if (!needsAssignedTo) {
      data.assignedTo = null;
      data.assignedToModel = null;
      data.assignedToName = "";
    } else {
      // set required model by status
      let requiredModel = null;
      if (finalStatus === "with technician") requiredModel = "Technician";
      if (finalStatus === "with cse") requiredModel = "Employee";
      if (finalStatus === "sold to customer" || finalStatus === "customer demo") requiredModel = "QstClient";

      data.assignedToModel = requiredModel;

      // ✅ require assignedTo + assignedToName
      if (!data.assignedTo) {
        return res.status(400).json({
          success: false,
          message: "Customer/Technician/CSE is required for this status (assignedTo missing)",
        });
      }

      if (!data.assignedToName || !String(data.assignedToName).trim()) {
        return res.status(400).json({
          success: false,
          message: "Customer/Technician/CSE name is required for this status (assignedToName missing)",
        });
      }
    }

    // ✅ demo rules
    if (finalStatus === "customer demo") {
      if (!data.demoFromDate || !data.demoToDate) {
        return res.status(400).json({
          success: false,
          message: "demoFromDate and demoToDate are required when status is customer demo",
        });
      }

      const from = new Date(data.demoFromDate);
      const to = new Date(data.demoToDate);

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid demoFromDate or demoToDate" });
      }
      if (to < from) {
        return res.status(400).json({ success: false, message: "demoToDate cannot be earlier than demoFromDate" });
      }

      data.demoFromDate = from;
      data.demoToDate = to;
    } else {
      data.demoFromDate = null;
      data.demoToDate = null;
    }

    const newSimMaster = new simMasterModel({
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

    await newSimMaster.save();

    res.status(201).json({
      success: true,
      message: "Sim Master created successfully",
      simMaster: newSimMaster,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSimMaster = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid sim master ID" });
    }

    const sim = await simMasterModel.findById(id);
    if (!sim) {
      return res.status(404).json({ success: false, message: "Sim Master not found" });
    }

    const prevStatus = sim.status;

    // ✅ keep keys even if "" so we can detect touched fields
    const updates = Object.fromEntries(Object.entries(req.body).filter(([_, v]) => v !== undefined));

    // ✅ monthlyDate mapping
    if (updates.monthlyDate !== undefined) {
      updates.monthlyBillingDate = updates.monthlyDate;
      delete updates.monthlyDate;
    }

    // ✅ parse purchaseDate if provided
    if (updates.purchaseDate !== undefined) {
      const parsed = new Date(updates.purchaseDate);
      if (!isNaN(parsed.getTime())) updates.purchaseDate = parsed;
      else delete updates.purchaseDate;
    }

    // ✅ normalize activationDate, then auto-set isSimActivated
    if (updates.activationDate !== undefined) {
      if (!updates.activationDate) {
        updates.activationDate = "";
      } else if (typeof updates.activationDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(updates.activationDate)) {
        // ok
      } else {
        const d = new Date(updates.activationDate);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          updates.activationDate = `${yyyy}-${mm}-${dd}`;
        } else {
          updates.activationDate = "";
        }
      }
    }

    // ✅ clean status empty
    if (updates.status === "" || updates.status === null) delete updates.status;

    const incomingStatus = updates.status;

    // ✅ detect if frontend actually sent assignment fields
    const assignedToTouched = Object.prototype.hasOwnProperty.call(req.body, "assignedTo");
    const assignedToNameTouched = Object.prototype.hasOwnProperty.call(req.body, "assignedToName");

    // don't assign status before validation
    delete updates.status;

    // ✅ apply other updates
    Object.assign(sim, updates);

    // ✅ activation auto (after assign)
    sim.isSimActivated = Boolean(sim.activationDate);

    if (incomingStatus) {
      const statusChanging = incomingStatus !== prevStatus;
      const needsAssignedTo = ["with technician", "with cse", "sold to customer", "customer demo"].includes(incomingStatus);

      // ✅ if status is changing to a "needsAssignedTo" status,
      // require user to send assignment again (prevents old carry-over)
      if (statusChanging && needsAssignedTo) {
        if (!assignedToTouched || !req.body.assignedTo) {
          return res.status(400).json({
            success: false,
            message: "Customer/Technician/CSE is required for this status (assignedTo missing)",
          });
        }
        if (!assignedToNameTouched || !req.body.assignedToName || !String(req.body.assignedToName).trim()) {
          return res.status(400).json({
            success: false,
            message: "Customer/Technician/CSE name is required for this status (assignedToName missing)",
          });
        }
      }

      // ✅ assignment handling
      if (!needsAssignedTo) {
        // if moved to stock/testing -> clear assignment
        sim.assignedTo = null;
        sim.assignedToModel = null;
        sim.assignedToName = "";
      } else {
        // set required model by status
        let requiredModel = null;
        if (incomingStatus === "with technician") requiredModel = "Technician";
        if (incomingStatus === "with cse") requiredModel = "Employee";
        if (incomingStatus === "sold to customer" || incomingStatus === "customer demo") requiredModel = "QstClient";

        sim.assignedToModel = requiredModel;

        // ✅ if status needs assignedTo, ALWAYS validate current doc values too
        if (!sim.assignedTo) {
          return res.status(400).json({
            success: false,
            message: "Customer/Technician/CSE is required for this status (assignedTo missing)",
          });
        }
        if (!sim.assignedToName || !String(sim.assignedToName).trim()) {
          return res.status(400).json({
            success: false,
            message: "Customer/Technician/CSE name is required for this status (assignedToName missing)",
          });
        }
      }

      // ✅ demo rules
      if (incomingStatus === "customer demo") {
        if (!sim.demoFromDate || !sim.demoToDate) {
          return res.status(400).json({
            success: false,
            message: "demoFromDate and demoToDate are required for customer demo",
          });
        }

        const from = new Date(sim.demoFromDate);
        const to = new Date(sim.demoToDate);

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
          return res.status(400).json({ success: false, message: "Invalid demoFromDate or demoToDate" });
        }
        if (to < from) {
          return res.status(400).json({ success: false, message: "demoToDate cannot be earlier than demoFromDate" });
        }

        sim.demoFromDate = from;
        sim.demoToDate = to;
      } else {
        sim.demoFromDate = null;
        sim.demoToDate = null;
      }

      // ✅ push history if status changed
      if (statusChanging) {
        sim.status = incomingStatus;
        sim.statusHistory = sim.statusHistory || [];
        sim.statusHistory.push({
          status: incomingStatus,
          changedAt: new Date(),
          changedBy: req.user?.name || req.user?.email || "system",
        });

        if (incomingStatus === "stock") {
          sim.stockEnteredAt = new Date();
        }
      }
    }

    const updated = await sim.save();

    res.status(200).json({
      success: true,
      message: "Sim Master updated successfully",
      simMaster: updated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getAllSimMasters = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { simOwner: { $regex: search, $options: "i" } },
          { simProvider: { $regex: search, $options: "i" } },
          { simNumber: { $regex: search, $options: "i" } },
          { mobileNumber: { $regex: search, $options: "i" } },
          { customerOrAlgoEmployeeName: { $regex: search, $options: "i" } },
          { assignedToName: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ],
      };
    }

    const totalCount = await simMasterModel.countDocuments(searchQuery);

    const raw = await simMasterModel
      .find(searchQuery)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const simMasters = raw.map((s) => {
      // ✅ days in stock
      let daysInStock = null;
      if (s.status === "stock") {
        const start = s.stockEnteredAt || s.createdAt;
        if (start) {
          daysInStock = Math.floor((Date.now() - new Date(start).getTime()) / MS_PER_DAY);
          if (daysInStock < 0) daysInStock = 0;
        } else daysInStock = 0;
      }

      // ✅ demo flags
      let demoDaysLeft = null;
      let demoAlert = false;
      let demoExpired = false;

      if (s.status === "customer demo" && s.demoToDate) {
        const end = new Date(s.demoToDate);
        end.setHours(0, 0, 0, 0);

        demoDaysLeft = Math.ceil((end - today) / MS_PER_DAY);
        demoExpired = demoDaysLeft < 0;
        demoAlert = isDemoExpiringSoon(s.demoToDate, 2);
      }

      return { ...s, daysInStock, demoDaysLeft, demoAlert, demoExpired };
    });

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: {
        simMasters,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          nextPage: page < totalPages ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null,
        },
      },
    });
  } catch (error) {
    console.error("Error in getAllSimMasters:", error);
    res.status(500).json({ success: false, message: error.message });
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


exports.bulkCreateSimMasters = async (req, res) => {
  try {
    const rawSims = req.body; // Expecting an array of sim objects

    if (!Array.isArray(rawSims) || rawSims.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of SIMs.",
      });
    }

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

    // 1. Get existing simNumbers and mobileNumbers to skip duplicates
    const allSimNumbers = cleanedSims.map((s) => s.simNumber).filter(Boolean);
    const allMobileNumbers = cleanedSims
      .map((s) => s.mobileNumber)
      .filter(Boolean);

    const existingSims = await simMasterModel.find(
      {
        $or: [
          { simNumber: { $in: allSimNumbers } },
          { mobileNumber: { $in: allMobileNumbers } },
        ],
      },
      "simNumber mobileNumber"
    );

    const existingSimNums = new Set(existingSims.map((s) => s.simNumber));
    const existingMobileNums = new Set(existingSims.map((s) => s.mobileNumber));

    const finalSimsToInsert = [];
    let duplicateCount = 0;
    const seenSimNums = new Set();
    const seenMobileNums = new Set();

    for (const sim of cleanedSims) {
      const isDuplicate =
        (sim.simNumber &&
          (existingSimNums.has(sim.simNumber) ||
            seenSimNums.has(sim.simNumber))) ||
        (sim.mobileNumber &&
          (existingMobileNums.has(sim.mobileNumber) ||
            seenMobileNums.has(sim.mobileNumber)));

      if (isDuplicate) {
        duplicateCount++;
      } else {
        finalSimsToInsert.push(sim);
        if (sim.simNumber) seenSimNums.add(sim.simNumber);
        if (sim.mobileNumber) seenMobileNums.add(sim.mobileNumber);
      }
    }

    let createdSims = [];
    if (finalSimsToInsert.length > 0) {
      createdSims = await simMasterModel.insertMany(finalSimsToInsert);
    }

    res.status(201).json({
      success: true,
      message: `${createdSims.length} SIMs imported successfully. ${duplicateCount} duplicates skipped.`,
      newCount: createdSims.length,
      duplicateCount: duplicateCount,
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
const mongoose = require("mongoose");
const State = require("../models/state.model");

// const addBulkStates =  async (req, res) => {
//   try {
//     const states = req.body.states; // Expecting array of states

//     if (!Array.isArray(states) || states.length === 0) {
//       return res.status(400).json({ message: "States array is required" });
//     }
//    console.log("Adding bulk states:", states);

//     // Insert many (ignores duplicates if same name exists)
//     const insertedStates = await State.insertMany(states);

//     res.status(201).json({
//       message: "States added successfully",
//       count: insertedStates.length,
//       states: insertedStates,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Failed to add states", error });
//   }
// }


// Get All States (Active + Inactive)
const getAllStates = async (req, res) => {
  try {
    // console.log("Fetching all states");
    const states = await State.find({}); // fetch all
    res.status(200).json({ count: states.length, states });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch states", error });
  }
};

// Get Only Active States
const getActiveStates = async (req, res) => {
  try {
    const states = await State.find({ isActive: true }).sort({ name: 1 }); // filter active only
    res.status(200).json({ count: states.length, states });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch active states", error });
  }
};



// // POST create a new state
// // expects JSON body: { name: "Maharashtra", shortName: "MH", isActive: true }
// const createState = async (req, res) => {
//   try {
//     const { name, shortName = "", isActive = true } = req.body;

//     // basic validation
//     if (!name || typeof name !== "string" || name.trim() === "") {
//       return res.status(400).json({ message: "Invalid or missing 'name' field" });
//     }

//     // optional: prevent duplicates by name (case-insensitive)
//     const existing = await State.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
//     if (existing) {
//       return res.status(409).json({ message: "State with this name already exists" });
//     }

//     const newState = new State({
//       name: name.trim(),
//       shortName: (shortName || "").trim(),
//       isActive: Boolean(isActive),
//     });

//     const saved = await newState.save();
//     return res.status(201).json({ message: "State created", state: saved });
//   } catch (error) {
//     console.error("createState error:", error);
//     return res.status(500).json({ message: "Failed to create state", error: error.message });
//   }
// };

// PATCH update a state partially

// body: any of { name, shortName, isActive }
// const updateState = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body || {};

//     // validate id
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid state id" });
//     }

//     // don't allow empty update
//     if (!Object.keys(updates).length) {
//       return res.status(400).json({ message: "No update fields provided" });
//     }

//     // If name provided, basic validation
//     if (updates.name && (typeof updates.name !== "string" || updates.name.trim() === "")) {
//       return res.status(400).json({ message: "Invalid 'name' value" });
//     }

//     // If shortName provided, ensure string
//     if (updates.shortName && typeof updates.shortName !== "string") {
//       return res.status(400).json({ message: "Invalid 'shortName' value" });
//     }

//     // Prepare sanitized update object
//     const allowed = {};
//     if (updates.name !== undefined) allowed.name = updates.name.trim();
//     if (updates.shortName !== undefined) allowed.shortName = updates.shortName.trim();
//     if (updates.isActive !== undefined) allowed.isActive = Boolean(updates.isActive);

//     // Optionally, check for duplicate name when changing name
//     if (allowed.name) {
//       const conflict = await State.findOne({ 
//         _id: { $ne: id },
//         name: { $regex: `^${allowed.name}$`, $options: "i" } 
//       });
//       if (conflict) {
//         return res.status(409).json({ message: "Another state with this name already exists" });
//       }
//     }

//     const updated = await State.findByIdAndUpdate(id, { $set: allowed }, { new: true, runValidators: true });

//     if (!updated) {
//       return res.status(404).json({ message: "State not found" });
//     }

//     return res.status(200).json({ message: "State updated", state: updated });
//   } catch (error) {
//     console.error("updateState error:", error);
//     return res.status(500).json({ message: "Failed to update state", error: error.message });
//   }
// };

const updateState = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};

    // validate id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid state id" });
    }

    // Prepare update object - ONLY isActive (ignore everything else)
    const allowed = {};
    if (updates.isActive !== undefined) {
      allowed.isActive = Boolean(updates.isActive);
    }

    // If no valid update provided (isActive not sent or undefined)
    if (!Object.keys(allowed).length) {
      return res.status(400).json({ message: "No valid update fields provided" });
    }

    const updated = await State.findByIdAndUpdate(
      id, 
      { $set: allowed }, 
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "State not found" });
    }

    return res.status(200).json({ message: "State status updated", state: updated });
  } catch (error) {
    console.error("updateState error:", error);
    return res.status(500).json({ message: "Failed to update state", error: error.message });
  }
};
 

module.exports = {
  // addBulkStates,
  getAllStates,
  getActiveStates,

  //  createState,
  updateState,
};
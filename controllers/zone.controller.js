const Zone=require("../models/zone.model");


exports.createZone=async(req,res)=>{
    try {
        const {zone}=req.body;
        const newZone=new Zone({zone});
        await newZone.save();
        res.status(200).json({
            success:true,
            message:"Zone created successfully",
            data:zone
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Error creating zone",
            error:error.message
        })
    }
}

exports.getAllZone = async (req, res) => {
    try {
        const zones = await Zone.find();
        res.status(200).json({
            success: true,
            data: zones,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching zones",
            error: error.message,
        });
    }
};


// Add a new city to a zone
exports.addCity = async (req, res) => {
  try {
    const { zone, city } = req.body;

    // Validate required fields
    if (!zone || !city) {
      return res.status(400).json({
        success: false,
        message: "Zone and city are required"
      });
    }

    // Validate zone enum
    const validZones = ["west1", "west2", "north", "south", "east"];
    const normalizedZone = zone.toLowerCase();
    
    if (!validZones.includes(normalizedZone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid zone. Allowed zones are: west1, west2, north, south, east"
      });
    }

    // Check if city already exists in this zone (case-insensitive)
    const existingCity = await Zone.findOne({
      zone: normalizedZone,
      city: { $regex: new RegExp(`^${city.trim()}$`, "i") }
    });

    if (existingCity) {
      return res.status(409).json({
        success: false,
        message: "City already exists in this zone"
      });
    }

    // Create new zone-city entry
    const newZone = new Zone({
      zone: normalizedZone,
      city: city.trim()
    });

    await newZone.save();

    res.status(201).json({
      success: true,
      message: "City added successfully",
      data: newZone
    });
  } catch (error) {
    console.error("Error adding city:", error);
    res.status(500).json({
      success: false,
      message: "Error adding city",
      error: error.message
    });
  }
};

// Update a city
exports.updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { zone, city } = req.body;

    // Validate required fields
    if (!zone || !city) {
      return res.status(400).json({
        success: false,
        message: "Zone and city are required"
      });
    }

    // Validate zone enum
    const validZones = ["west1", "west2", "north", "south", "east"];
    const normalizedZone = zone.toLowerCase();
    
    if (!validZones.includes(normalizedZone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid zone. Allowed zones are: west1, west2, north, south, east"
      });
    }

    // Check if zone-city entry exists
    const existingZone = await Zone.findById(id);
    if (!existingZone) {
      return res.status(404).json({
        success: false,
        message: "Zone-city entry not found"
      });
    }

    // Check for duplicate (case-insensitive, excluding current entry)
    const duplicate = await Zone.findOne({
      _id: { $ne: id },
      zone: normalizedZone,
      city: { $regex: new RegExp(`^${city.trim()}$`, "i") }
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "City already exists in this zone"
      });
    }

    // Update the entry
    existingZone.zone = normalizedZone;
    existingZone.city = city.trim();
    await existingZone.save();

    res.status(200).json({
      success: true,
      message: "City updated successfully",
      data: existingZone
    });
  } catch (error) {
    console.error("Error updating city:", error);
    res.status(500).json({
      success: false,
      message: "Error updating city",
      error: error.message
    });
  }
};

// Delete a city
exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    const zone = await Zone.findById(id);
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: "Zone-city entry not found"
      });
    }

    await Zone.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "City deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting city:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting city",
      error: error.message
    });
  }
};

// Check if city already exists in a zone
exports.checkCityExists = async (req, res) => {
  try {
    const { zone, city } = req.query;

    // Validate required fields
    if (!zone || !city) {
      return res.status(400).json({
        success: false,
        message: "Zone and city are required as query parameters"
      });
    }

    // Validate zone enum
    const validZones = ["west1", "west2", "north", "south", "east"];
    const normalizedZone = zone.toLowerCase();
    
    if (!validZones.includes(normalizedZone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid zone. Allowed zones are: west1, west2, north, south, east"
      });
    }

    // Check if city already exists in this zone (case-insensitive)
    const existingCity = await Zone.findOne({
      zone: normalizedZone,
      city: { $regex: new RegExp(`^${city.trim()}$`, "i") }
    });

    res.status(200).json({
      success: true,
      exists: !!existingCity,
      message: existingCity 
        ? "City already exists in this zone" 
        : "City does not exist in this zone",
      data: existingCity || null
    });
  } catch (error) {
    console.error("Error checking city existence:", error);
    res.status(500).json({
      success: false,
      message: "Error checking city existence",
      error: error.message
    });
  }
};
const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema({
    zone: {
        type: String,
        enum: ["west1", "west2", "north", "south", "east"],
        required: true
    },
    city: {
        type: String,
        required: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Zone", zoneSchema);
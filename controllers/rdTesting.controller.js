const mongoose = require("mongoose");
const DeviceMaster = require("../models/deviceMaster");
const SimMaster = require("../models/simMaster");
const AccessoryMaster = require("../models/accessoryMaster");
const { uploadBase64ImageToS3 } = require("../utils/uploadToS3");

// ── shared core logic ──────────────────────────────────────────────────────────
const rdTestItem = async (model, id, { testingStatus, images = [] }, userName) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { code: 400, body: { success: false, message: "Invalid ID" } };
    }

    const item = await model.findById(id);
    if (!item) {
        return { code: 404, body: { success: false, message: "Item not found" } };
    }

    const validStatuses = ["tested ok", "tested not ok"];
    if (!validStatuses.includes(testingStatus)) {
        return {
            code: 400,
            body: { success: false, message: `testingStatus must be one of: ${validStatuses.join(", ")}` },
        };
    }

    // ── Upload images to S3 ──────────────────────────────────────────────────────
    const itemType = model.modelName.toLowerCase().replace("master", ""); // "device" | "sim" | "accessory"
    const uploadedUrls = [];

    for (let i = 0; i < images.length; i++) {
        const url = await uploadBase64ImageToS3(
            images[i],
            `rd-testing/${itemType}`,
            `${id}_photo_${i + 1}`
        );
        uploadedUrls.push(url);
    }

    // ── Determine new status ─────────────────────────────────────────────────────
    // tested ok       → "stock"   (cleared and back in inventory)
    // tested not ok   → "testing" (remains in testing queue for re-work)
    const newStatus = testingStatus === "tested ok" ? "stock" : "testing";

    // ── Push status history ──────────────────────────────────────────────────────
    const historyMessage = `R&D team marked it as ${testingStatus}`;

    item.statusHistory = item.statusHistory || [];
    item.statusHistory.push({
        status: newStatus,
        changedAt: new Date(),
        changedBy: historyMessage,
    });

    // ── Update fields ────────────────────────────────────────────────────────────
    item.testingStatus = testingStatus;
    item.status = newStatus;

    // Replace images with the newly uploaded set (not append)
    if (uploadedUrls.length > 0) {
        item.images = [...(item.images || []), ...uploadedUrls];
    }

    if (newStatus === "stock") {
        item.stockEnteredAt = new Date();
        item.assignedTo = null;
        item.assignedToModel = null;
    }

    await item.save();

    return {
        code: 200,
        body: {
            success: true,
            message: `Item marked as "${testingStatus}" successfully`,
            testingStatus,
            newStatus,
            imageUrls: uploadedUrls,
            item,
        },
    };
};

// ── shared delete-image logic ──────────────────────────────────────────────────
const rdDeleteImage = async (model, id, imageUrl) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { code: 400, body: { success: false, message: "Invalid ID" } };
    }
    if (!imageUrl) {
        return { code: 400, body: { success: false, message: "imageUrl is required" } };
    }

    const item = await model.findById(id);
    if (!item) {
        return { code: 404, body: { success: false, message: "Item not found" } };
    }

    const before = (item.images || []).length;
    item.images = (item.images || []).filter((url) => url !== imageUrl);
    const after = item.images.length;

    if (before === after) {
        return { code: 404, body: { success: false, message: "Image URL not found on this item" } };
    }

    await item.save();

    return {
        code: 200,
        body: {
            success: true,
            message: "Image removed successfully",
            images: item.images,
        },
    };
};

// ── DEVICE ────────────────────────────────────────────────────────────────────
exports.rdTestDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const { testingStatus, images } = req.body;
        const userName = req.user?.name || req.user?.email || "r&d";
        const result = await rdTestItem(DeviceMaster, id, { testingStatus, images }, userName);
        res.status(result.code).json(result.body);
    } catch (err) {
        console.error("rdTestDevice error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.rdDeleteDeviceImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;
        const result = await rdDeleteImage(DeviceMaster, id, imageUrl);
        res.status(result.code).json(result.body);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── SIM ───────────────────────────────────────────────────────────────────────
exports.rdTestSim = async (req, res) => {
    try {
        const { id } = req.params;
        const { testingStatus, images } = req.body;
        const userName = req.user?.name || req.user?.email || "r&d";
        const result = await rdTestItem(SimMaster, id, { testingStatus, images }, userName);
        res.status(result.code).json(result.body);
    } catch (err) {
        console.error("rdTestSim error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.rdDeleteSimImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;
        const result = await rdDeleteImage(SimMaster, id, imageUrl);
        res.status(result.code).json(result.body);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── ACCESSORY ─────────────────────────────────────────────────────────────────
exports.rdTestAccessory = async (req, res) => {
    try {
        const { id } = req.params;
        const { testingStatus, images } = req.body;
        const userName = req.user?.name || req.user?.email || "r&d";
        const result = await rdTestItem(AccessoryMaster, id, { testingStatus, images }, userName);
        res.status(result.code).json(result.body);
    } catch (err) {
        console.error("rdTestAccessory error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.rdDeleteAccessoryImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;
        const result = await rdDeleteImage(AccessoryMaster, id, imageUrl);
        res.status(result.code).json(result.body);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

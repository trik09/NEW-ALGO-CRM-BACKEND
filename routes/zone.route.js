const express = require("express");
const router = express.Router();
const { getAllZone } = require("../controllers/zone.controller");
const { createZone } = require("../controllers/zone.controller");

router.get("/get-all-zone", getAllZone);
router.post("/create-zone", createZone);

module.exports = router;
const express = require("express");
const router = express.Router();
const { getAllZone } = require("../controllers/zone.controller");
const { createZone } = require("../controllers/zone.controller");
const {addCity, updateCity, deleteCity, checkCityExists} = require("../controllers/zone.controller");
router.get("/get-all-zone", getAllZone);
router.post("/create-zone", createZone);
router.get('/check-city-exists',  checkCityExists);

// Add a new city to a zone
router.post('/add-city',  addCity);

// Update a city
router.put('/update-city/:id',  updateCity);

// Delete a city
router.delete('/delete-city/:id',  deleteCity);

// check if city exists in a zone
router.get('/check-city-exists-in-zone',  checkCityExists);

module.exports = router;
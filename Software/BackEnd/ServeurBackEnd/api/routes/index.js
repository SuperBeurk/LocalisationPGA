const express = require('express');
const router = express.Router();

const tagsController = require('../controllers/tags.controller');
const beaconsController = require('../controllers/beacons.controller');

//Définir toutes les routes de notre API
router.get("/beacons", beaconsController.getAll);
router.get("/tags", tagsController.getAll);
router.get("/tags/get/positions",tagsController.liveTracking);
router.get("/tags/get/historyPositions",tagsController.getHistory);
router.post('/tags/update/positions', tagsController.updatePositions);


module.exports = router;

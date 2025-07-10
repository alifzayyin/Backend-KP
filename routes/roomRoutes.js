const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { auth, authorize } = require('../auth');

router.get('/rooms', roomController.getRooms);
router.post('/rooms', auth, authorize('admin'), roomController.addRoom);
router.put('/rooms/:id', auth, authorize('admin'), roomController.updateRoom);
router.delete('/rooms/:id', auth, authorize('admin'), roomController.deleteRoom);

module.exports = router;
const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { auth, authorize } = require('../auth');

router.get('/announcements', announcementController.getAnnouncements);
router.post('/announcements', auth, authorize('admin'), announcementController.addAnnouncement);

module.exports = router;
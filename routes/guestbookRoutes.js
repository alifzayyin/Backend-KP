const express = require('express');
const router = express.Router();
const guestbookController = require('../controllers/guestbookController');
const { auth, authorize } = require('../auth');

router.get('/guestbook', guestbookController.getGuestbookEntries);
router.post('/guestbook', auth, authorize('admin'), guestbookController.addGuestbookEntry);
router.put('/guestbook/:id', auth, authorize('admin'), guestbookController.updateGuestbookStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const guestbookController = require('../controllers/guestbookController');
const { auth, authorize } = require('../auth');

router.get('/guestbook', guestbookController.getGuestbookEntries);
router.post('/guestbook', auth, guestbookController.addGuestbookEntry);
router.put('/guestbook/:id', auth, guestbookController.updateGuestbookEntry);
router.delete('/guestbook/:id', auth, guestbookController.deleteGuestbookEntry);
router.put('/guestbook/:id/status', auth, authorize('admin'), guestbookController.updateGuestbookStatus);

module.exports = router;
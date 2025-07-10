const express = require('express');
   const router = express.Router();
   const guestbookController = require('../controllers/guestbookController');

   router.get('/guestbook', guestbookController.getGuestbookEntries);
   router.post('/guestbook', guestbookController.addGuestbookEntry);

   module.exports = router;
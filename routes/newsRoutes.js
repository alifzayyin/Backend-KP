const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { auth, authorize } = require('../auth');

// Rute untuk Berita
router.get('/news', newsController.getNews); // Publik
router.post('/news', auth, authorize('admin'), newsController.addNews); // Hanya admin
router.put('/news/:id', auth, authorize('admin'), newsController.updateNews); // Hanya admin
router.delete('/news/:id', auth, authorize('admin'), newsController.deleteNews); // Hanya admin

module.exports = router;
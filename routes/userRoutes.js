// D:\backend\routes\userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../auth');
const newsController = require('../controllers/newsController');

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.getProfile);
router.get('/auth/me', auth, userController.getProfile);

router.get('/berita', newsController.getNews);
router.post('/berita', auth, newsController.addNews);
router.put('/berita/:id', auth, newsController.updateNews); // Edit berita
router.delete('/berita/:id', auth, newsController.deleteNews); // Hapus berita

module.exports = router;
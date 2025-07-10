const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { auth, authorize } = require('../auth');

// Rute untuk Galeri
router.get('/gallery', galleryController.getGallery);
router.post('/gallery', auth, authorize('admin'), galleryController.upload, galleryController.addGalleryItem);
router.put('/gallery/:id', auth, authorize('admin'), galleryController.updateGalleryItem);
router.delete('/gallery/:id', auth, authorize('admin'), galleryController.deleteGalleryItem);

module.exports = router;
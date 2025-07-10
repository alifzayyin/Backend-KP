const express = require('express');
  const router = express.Router();
  const berandaController = require('../controllers/berandaController');
  const { auth } = require('../auth');

  router.get('/', auth, berandaController.getBeranda);
  router.put('/', auth, berandaController.upload, berandaController.updateBeranda);
  
  module.exports = router;
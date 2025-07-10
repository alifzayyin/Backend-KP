const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { auth, authorize } = require('../auth');

router.get('/communities', communityController.getCommunities);
router.post('/communities/import', auth, authorize('admin'), communityController.importCommunities); // Impor CSV
router.post('/communities', auth, authorize('admin'), communityController.addCommunity);
router.put('/communities/:id', auth, authorize('admin'), communityController.updateCommunity);
router.delete('/communities/:id', auth, authorize('admin'), communityController.deleteCommunity);
router.post('/communities/register', auth, communityController.registerToCommunity); // User
router.get('/communities/user', auth, communityController.getUserCommunities); // User

module.exports = router;
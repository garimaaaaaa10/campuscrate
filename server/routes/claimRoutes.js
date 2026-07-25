const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createClaim, updateClaimStatus, getMyClaims, getClaimsForMyItems } = require('../controllers/claimController');

router.post('/', protect, createClaim);
router.patch('/:id', protect, updateClaimStatus);
router.get('/my-claims', protect, getMyClaims);
router.get('/for-my-items', protect, getClaimsForMyItems);

module.exports = router;
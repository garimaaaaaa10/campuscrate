const Claim = require('../models/claim');
const Item = require('../models/items');

exports.createClaim = async (req, res) => {
  try {
    const { itemId, answer } = req.body;
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    if (item.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Item already returned' });
    }
    if (item.user.toString() === (req.user._id || req.user.id).toString()) {
      return res.status(400).json({ success: false, message: 'You cannot claim your own item' });
    }

    const newClaim = await Claim.create({
      itemId,
      claimantId: req.user._id || req.user.id,
      answer,
    });

    res.status(201).json({ success: true, data: newClaim });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found' });
    }

    const item = await Item.findById(claim.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Associated item not found' });
    }

    if (item.user.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    claim.status = status;
    await claim.save();

    if (status === 'approved') {
      item.status = 'returned';
      await item.save();
    }

    res.status(200).json({ success: true, data: claim });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getClaimsForMyItems = async (req, res) => {
  try {
    const items = await Item.find({ user: req.user._id || req.user.id });
    const itemIds = items.map(item => item._id);

    const claims = await Claim.find({ itemId: { $in: itemIds } })
      .populate('claimantId', 'name email')
      .populate('itemId', 'title type status')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimantId: req.user._id || req.user.id })
      .populate('itemId', 'title type status')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
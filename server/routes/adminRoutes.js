const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/user');
const Item = require('../models/items');
const Report = require('../models/report');

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

router.get('/reports', protect, adminOnly, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'name email')
      .populate('reportedItemId', 'title')
      .populate('reportedUserId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/reports/:id', protect, adminOnly, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/block', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { blocked: req.body.blocked }, { new: true });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/items/:id', protect, adminOnly, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted by admin' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/report', protect, async (req, res) => {
  try {
    const report = await Report.create({
      reporterId: req.user._id || req.user.id,
      ...req.body
    });
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const itemCount = await Item.countDocuments();
    const reportCount = await Report.countDocuments({ status: 'pending' });
    res.json({ success: true, data: { userCount, itemCount, reportCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

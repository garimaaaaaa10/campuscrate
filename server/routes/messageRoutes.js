const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Message = require('../models/message');

router.get('/:itemId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ itemId: req.params.itemId })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { itemId, receiverId, text } = req.body;
    const newMessage = await Message.create({
      itemId,
      senderId: req.user._id || req.user.id,
      receiverId,
      text
    });
    
    await newMessage.populate('senderId', 'name');
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;

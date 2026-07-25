const Item = require('../models/items');

exports.createItem = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const imageUrl = req.file ? req.file.path : '';
    let parsedTags = [];
    if (req.body.tags) {
      try {
        parsedTags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
      } catch (e) {
        console.error('Error parsing tags:', e);
      }
    }

    const newItem = await Item.create({
      ...req.body,
      user: userId,
      tags: parsedTags,
      imageUrl: imageUrl || req.body.imageUrl || '',
    });

    const inverseType = newItem.type === 'lost' ? 'found' : 'lost';
    const keywords = newItem.title.toLowerCase().split(' ').filter(w => w.length > 3);
    
    let query = {
      type: inverseType,
      category: newItem.category,
      status: 'active'
    };
    
    if (keywords.length > 0) {
      const regexPattern = keywords.join('|');
      query.$or = [
        { title: { $regex: regexPattern, $options: 'i' } },
        { description: { $regex: regexPattern, $options: 'i' } }
      ];
    }
    
    const potentialMatches = await Item.find(query).limit(5);

    res.status(201).json({
      success: true,
      data: newItem,
      matches: potentialMatches
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ user: req.user._id || req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('user', 'name email');
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    if (item.user.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this item' });
    }
    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    if (item.user.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this item' });
    }
    await Item.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Item removed' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid ID format' });
  }
};
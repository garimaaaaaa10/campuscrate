const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { 
      type: String, 
      required: [true, 'Please provide an item title'] 
    },
    description: { 
      type: String, 
      required: [true, 'Please provide a description'] 
    },
    category: { 
      type: String, 
      required: true,
      enum: ['Electronics', 'ID Cards/Docs', 'Keys', 'Clothing', 'Books', 'Other'] 
    },
    type: { 
      type: String, 
      required: true, 
      enum: ['lost', 'found'] 
    },
    location: { 
      type: String, 
      required: [true, 'Please specify where it was lost or found'] 
    },
    status: { 
      type: String, 
      enum: ['active', 'claimed', 'returned'], 
      default: 'active' 
    },
    imageUrl: {
      type: String,
      default: ''
    },
    claimQuestion: {
      type: String,
      default: ''
    },
    tags: [{
      type: String
    }]
  },
  { timestamps: true }
);
module.exports = mongoose.model('Item', itemSchema);
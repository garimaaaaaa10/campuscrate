const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  getMyItems
} = require('../controllers/itemController');

router.route('/')
  .get(getItems)
  .post(protect, upload.single('image'), createItem);

router.route('/me')
  .get(protect, getMyItems);

router.route('/:id')
  .get(getItemById)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

module.exports = router;
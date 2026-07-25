require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');
    const user = await User.findOne({ email: 'test@example.com' });
    console.log('Query result:', user);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};
run();

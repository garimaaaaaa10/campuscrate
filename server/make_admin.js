require('dotenv').config({path: '../.env'});
const mongoose = require('mongoose');
const User = require('./models/user');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await User.updateMany({}, { role: 'admin' });
    console.log(`Updated ${result.modifiedCount} users to admin!`);
  } catch(e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
  }
}
run();

const mongoose = require('mongoose');

const uri = "mongodb+srv://abhikhajuriaa22_db_user:DlM9Ihqm9aP70oYH@abhi.di03eig.mongodb.net/lostandfound?retryWrites=true&w=majority&appName=Abhi";

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('SUCCESSFULLY CONNECTED TO ATLAS!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('FAILED TO CONNECT:', err.message);
    process.exit(1);
  });

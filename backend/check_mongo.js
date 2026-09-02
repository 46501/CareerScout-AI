require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || '';
console.log('Connecting to MongoDB...');
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(async () => {
    console.log('Connected!');
    const db = mongoose.connection.db;
    
    // Check if we can actually query the users collection
    console.log('Attempting to query users...');
    const start = Date.now();
    try {
      const users = await db.collection('users').find({}).limit(1).toArray();
      console.log('Successfully queried users in', Date.now() - start, 'ms');
      console.log('Found', users.length, 'users');
    } catch (e) {
      console.error('Query failed:', e);
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.log('Connection failed:', err);
  });

// config/db.js

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
console.log('Connecting to MongoDB:', MONGODB_URI);
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Db connected');
  } catch (error) {
    console.error('DB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB };

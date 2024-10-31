const dotenv = require('dotenv');
const mongoose = require('mongoose');

// load env vars
dotenv.config({ path: './.env' });

//  Mongoose returns a promise so we will use async and await
const connectDB = async () => {
  const conn = await mongoose.connect(process.env.DB_URL);

  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;
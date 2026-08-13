const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  const url = (
    process.env.MONGODB_URI_WITH_DATABASE ||
    process.env.MONGODB_URI ||
    ""
  ).trim();
  if (!url) {
    throw new Error(
      "Missing MongoDB URI. Set MONGODB_URI or MONGODB_URI_WITH_DATABASE in basics/.env."
    );
  }
  const dbName = process.env.MONGODB_DB_NAME?.trim();
  const opts = dbName ? { dbName } : {};
  try {
    await mongoose.connect(url, opts);
    console.log(
      "Connected to MongoDB — db:",
      mongoose.connection.name,
      "| host:",
      mongoose.connection.host,
      "(compare this host with your Compass connection string)"
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

// if you want to use the connectDB then run node mongooseConfig/dataBaseCon.js and uncomment the code below
// connectDB().then(()=>{
//   console.log('Connected to MongoDB in then clause');
// }).catch((err)=>{
//   console.log('Connected to MongoDB in catch clause', err);
// })

module.exports = { connectDB };

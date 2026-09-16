const mongoose = require("mongoose");

let isConnected = 0;

const connectDB = async () => {
  if (isConnected === 1) {
    return;
  }

  if (!process.env.MONGO_URI) {
    console.warn("MONGO_URI not specified. Running in demo mode.");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = conn.connections[0].readyState;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`DB connection failed: ${err.message}`);
  }
};

module.exports = connectDB;

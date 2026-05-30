require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const MONGO_URI = process.env.MONGO_URI;

// Cache the connection
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  cachedConnection = await mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Fail faster if unable to connect
  bufferCommands: false,         // 🔴 DISABLE BUFFERING
});
  return cachedConnection;
}

// Export as a serverless function handler
module.exports = async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};
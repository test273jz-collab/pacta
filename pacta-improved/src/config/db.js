const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is missing in environment variables");
}

const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, mongooseOptions);
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
}

mongoose.connection.on("connected", () => {
  console.log("✅ DB CONNECTED");
});

mongoose.connection.on("error", (err) => {
  console.log("❌ DB ERROR:", err.message);
});

module.exports = connectDB;
require("dotenv").config();

const app = require("./app");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
console.log("MONGO_URI:", process.env.MONGO_URI?.slice(0, 50));
if (!MONGO_URI) {
  throw new Error("MONGO_URI missing");
}

// 🔴 CRITICAL FIX
async function start() {
  try {
    console.log("Connecting to MongoDB...");
mongoose.connect(
  "mongodb+srv://djdidoussama_db_user:LhrCKuYtDuxq874Q@cluster1.1eraxfk.mongodb.net/?appName=Cluster1",
  (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("Connected to mongodb database successfully!");
  }
);

    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

start();
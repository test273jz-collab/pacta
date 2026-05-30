require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Validate environment variables
if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI environment variable is not defined");
  process.exit(1);
}


const startServer = async () => {
  await connectDB(); // MUST WAIT

  app.listen(PORT, () => {
    console.log("Server running");
  });
};





if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is not defined");
  process.exit(1);
}




// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.name, err.message);
  console.error(err.stack);
  server?.close(() => process.exit(1));
});

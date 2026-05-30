// Import the 'mongoose' library to connect to MongoDB
const mongoose = require("mongoose");

// Import the 'dotenv' library to load environment variables from a .env file
const dotenv = require("dotenv");

// Configure dotenv to load environment variables from the .env file into 'process.env'
dotenv.config();

// Define an asynchronous function to connect to MongoDB
const connectDB = async () => {
  try {
    // Use mongoose to connect to MongoDB using the URI stored in the MONGO_URI environment variable
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // Ensures MongoDB connection string is parsed correctly
      useUnifiedTopology: true, // Enables a new connection management engine in mongoose
    });

    // Log a success message to the console if the connection is successful
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log the error message if there's an issue with the connection
    console.error(`Error: ${error.message}`);

    // Exit the process with failure code (1) if connection fails
    process.exit(1);
  }
};

// Export the connectDB function so it can be used in other parts of the application
module.exports = connectDB;
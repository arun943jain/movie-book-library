import mongoose from "mongoose";

// Connect to MongoDB using the connection string from process.env.MONGO_URI.
// The server (server.js) calls this function at startup.
// If the connection fails, we log the error and exit the process (code 1)
// because the API cannot work without a database.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    // Exit process with failure — DB is required for the app to run
    process.exit(1);
  }
};

export default connectDB;

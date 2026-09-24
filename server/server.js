import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import itemRoutes from "./routes/itemRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Global middleware ----------
app.use(cors()); // Allow cross-origin requests from the frontend
app.use(express.json()); // Parse JSON request bodies

// ---------- Health / welcome route ----------
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Movie & Book Library API is running",
  });
});

// ---------- API routes ----------
app.use("/api/items", itemRoutes);

// ---------- 404 handler for unknown routes ----------
// Must be placed AFTER all valid routes but BEFORE the error handler.
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---------- Centralized error handler (must be last) ----------
app.use(errorHandler);

// ---------- Start server after DB connects ----------
// connectDB() exits the process if the connection fails.
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

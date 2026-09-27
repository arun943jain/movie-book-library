import mongoose from "mongoose";

// Item schema — single collection stores both Movies and Books.
// The `type` field ("Movie" | "Book") distinguishes them.
//
// FRONTEND COMPATIBILITY:
// - Frontend sends `runtime`  -> stored here as `runtimeOrPages`
// - Frontend sends `director` -> stored here as `directorOrAuthor`
// The mapping is done in controllers/itemController.js (normalizeItemInput).
// Only the canonical fields below are persisted in MongoDB.
const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: ["Movie", "Book"],
        message: "Type must be either 'Movie' or 'Book'",
      },
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
    poster: {
      type: String,
      default: "",
      trim: true,
    },
    year: {
      type: Number,
    },
    directorOrAuthor: {
      type: String,
      default: "",
      trim: true,
    },
    runtimeOrPages: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    // Automatically adds `createdAt` and `updatedAt` fields
    timestamps: true,
  }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;

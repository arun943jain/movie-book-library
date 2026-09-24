import mongoose from "mongoose";
import Item from "../models/Item.js";

// Helper: check if an id is a valid MongoDB ObjectId.
// Used by getSingle / update / delete to return 400 instead of a CastError.
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// =====================================================
// @desc    Create a new movie/book
// @route   POST /api/items
// @access  Public
// =====================================================
export const createItem = async (req, res, next) => {
  try {
    const newItem = await Item.create(req.body);

    return res.status(201).json({
      success: true,
      data: newItem,
    });
  } catch (error) {
    // Forward to centralized error handler (handles ValidationError, etc.)
    next(error);
  }
};

// =====================================================
// @desc    Get all items with search, filter, sort + pagination
// @route   GET /api/items
// @query   ?search=&genre=&type=&rating=&page=&limit=&sort=
// @access  Public
//
// Examples:
//   /api/items?search=harry
//   /api/items?genre=Action
//   /api/items?type=Movie
//   /api/items?rating=8            (rating >= 8)
//   /api/items?page=1&limit=6
//   /api/items?sort=newest | oldest | rating
// =====================================================
export const getAllItems = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      type,
      rating,
      page = "1",
      limit = "6",
      sort,
    } = req.query;

    // ---- Build MongoDB filter object ----
    const filter = {};

    // 1) SEARCH: case-insensitive regex on title + directorOrAuthor
    if (search) {
      const regex = new RegExp(search, "i"); // "i" = case-insensitive
      filter.$or = [{ title: regex }, { directorOrAuthor: regex }];
    }

    // 2) GENRE FILTER: exact match, case-insensitive
    //    e.g. ?genre=Action matches "Action", "action", "ACTION"
    if (genre) {
      filter.genre = new RegExp(`^${genre}$`, "i");
    }

    // 3) TYPE FILTER: must be "Movie" or "Book"
    if (type) {
      if (!["Movie", "Book"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Type filter must be either 'Movie' or 'Book'",
        });
      }
      filter.type = type;
    }

    // 4) RATING FILTER: return items with rating >= requested value
    //    e.g. ?rating=8 returns items rated 8, 9, 10
    if (rating !== undefined && rating !== "") {
      const ratingNumber = Number(rating);
      if (Number.isNaN(ratingNumber)) {
        return res.status(400).json({
          success: false,
          message: "Rating filter must be a number",
        });
      }
      filter.rating = { $gte: ratingNumber };
    }

    // ---- Pagination ----
    let pageNumber = parseInt(page, 10);
    let limitNumber = parseInt(limit, 10);

    if (Number.isNaN(pageNumber) || pageNumber < 1) pageNumber = 1;
    if (Number.isNaN(limitNumber) || limitNumber < 1) limitNumber = 6;
    // Safety cap so one request can't pull the whole collection
    if (limitNumber > 50) limitNumber = 50;

    const skip = (pageNumber - 1) * limitNumber;

    // ---- Sorting ----
    // sort=newest -> createdAt desc (default)
    // sort=oldest -> createdAt asc
    // sort=rating -> rating desc
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "rating") {
      sortOption = { rating: -1 };
    } else if (sort === "newest" || !sort) {
      sortOption = { createdAt: -1 };
    }
    // Unknown sort values fall back to default (newest) instead of erroring.

    // ---- Execute query ----
    const totalItems = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(totalItems / limitNumber) || 0;

    return res.status(200).json({
      success: true,
      currentPage: pageNumber,
      totalPages,
      totalItems,
      count: items.length,
      items,
      // `data` is an alias of `items` so the response also matches the
      // standard { success: true, data: ... } format used everywhere else.
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public
// =====================================================
export const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Handle invalid MongoDB ObjectId early with a clear 400 message
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Update item by ID
// @route   PUT /api/items/:id
// @access  Public
// =====================================================
export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    // `new: true` returns the updated document.
    // `runValidators: true` enforces schema rules (enum, min/max, required) on update.
    const updatedItem = await Item.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// @desc    Delete item by ID
// @route   DELETE /api/items/:id
// @access  Public
// =====================================================
export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      data: deletedItem,
    });
  } catch (error) {
    next(error);
  }
};

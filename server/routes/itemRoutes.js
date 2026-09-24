import express from "express";
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

const router = express.Router();

// Collection routes
router.route("/").post(createItem).get(getAllItems);

// Single-item routes
router.route("/:id").get(getItemById).put(updateItem).delete(deleteItem);

export default router;

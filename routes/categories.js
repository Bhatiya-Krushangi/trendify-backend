import express from "express";
import Category from "../models/Category.js";
import Post from "../models/Post.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public: list all categories with article counts
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
    const withCounts = await Promise.all(
      categories.map(async (c) => {
        const count = await Post.countDocuments({ category: c._id, status: "published" });
        return { ...c, articleCount: count };
      })
    );
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: create
router.post("/", protect, async (req, res) => {
  try {
    const maxCategory = await Category.findOne().sort({ order: -1 }).select("order").lean();
    const nextOrder = maxCategory && typeof maxCategory.order === "number" ? maxCategory.order + 1 : 0;
    const category = await Category.create({ ...req.body, order: nextOrder });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: reorder
router.put("/reorder", protect, async (req, res) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({ message: "orders must be an array of { id, order }" });
    }
    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));
    await Category.bulkWrite(bulkOps);
    res.json({ message: "Category order updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update
router.put("/:id", protect, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: delete
router.delete("/:id", protect, async (req, res) => {
  try {
    const inUse = await Post.countDocuments({ category: req.params.id });
    if (inUse > 0) {
      return res.status(400).json({ message: `Cannot delete: ${inUse} post(s) use this category` });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

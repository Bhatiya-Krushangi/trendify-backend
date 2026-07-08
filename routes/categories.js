import express from "express";
import Category from "../models/Category.js";
import Post from "../models/Post.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public: list all categories with article counts
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
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
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
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

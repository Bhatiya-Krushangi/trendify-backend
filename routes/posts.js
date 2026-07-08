import express from "express";
import Post from "../models/Post.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public: list published posts with filters, search, pagination
router.get("/", async (req, res) => {
  try {
    const { category, search, featured, limit = 10, page = 1, exclude, sort = "-createdAt" } = req.query;
    const query = { status: "published" };

    if (category) {
      const Category = (await import("../models/Category.js")).default;
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
      else return res.json({ posts: [], total: 0, page: 1, pages: 0 });
    }
    if (featured === "true") query.featured = true;
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { title: regex },
        { excerpt: regex },
        { tags: regex },
      ];
    }
    if (exclude) query._id = { $ne: exclude };

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 50);

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate("category", "name slug color")
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    res.json({ posts, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: trending (most viewed, last resort createdAt)
router.get("/trending", async (req, res) => {
  try {
    const posts = await Post.find({ status: "published" })
      .populate("category", "name slug color")
      .sort({ views: -1, createdAt: -1 })
      .limit(4)
      .lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: list ALL posts (draft + published) for dashboard
router.get("/admin/all", protect, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("category", "name slug color")
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: get single post by slug (+ increments views)
router.get("/:slug", async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug },
      { $inc: { views: 1 } },
      { new: true }
    ).populate("category", "name slug color");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: create post
router.post("/", protect, async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: get by id (for editing)
router.get("/id/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("category", "name slug color");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update post
router.put("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    Object.assign(post, req.body);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: delete post
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

import express from "express";
import Category from "../models/Category.js";
import Post from "../models/Post.js";

const router = express.Router();

// Resolve any slug to either category or post
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // 1. Check if category
    const category = await Category.findOne({ slug });
    if (category) {
      return res.json({ type: "category", data: category });
    }

    // 2. Check if post by slug or urltitle
    const post = await Post.findOne({
      $or: [{ slug }, { urltitle: slug }],
    }).populate("category", "name slug color");
    if (post) {
      return res.json({ type: "post", data: post });
    }

    return res.status(404).json({ message: "Not found" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

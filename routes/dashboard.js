import express from "express";
import Post from "../models/Post.js";
import Category from "../models/Category.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", protect, async (req, res) => {
  try {
    const [totalPosts, publishedPosts, draftPosts, totalCategories, totalComments, pendingComments, totalUsers] =
      await Promise.all([
        Post.countDocuments(),
        Post.countDocuments({ status: "published" }),
        Post.countDocuments({ status: "draft" }),
        Category.countDocuments(),
        Comment.countDocuments(),
        Comment.countDocuments({ status: "pending" }),
        User.countDocuments(),
      ]);

    const recentPosts = await Post.find()
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title category status createdAt");

    const totalViewsAgg = await Post.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]);
    const totalViews = totalViewsAgg[0]?.total || 0;

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalCategories,
      totalComments,
      pendingComments,
      totalViews,
      totalUsers,
      recentPosts,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

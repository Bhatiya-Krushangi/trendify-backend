import express from "express";
import Comment from "../models/Comment.js";
import { protect } from "../middleware/auth.js";
import { protectUser } from "../middleware/protectUser.js";

const router = express.Router();

// Public: get approved comments for a post
router.get("/post/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, status: "approved" }).sort({
      createdAt: -1,
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Requires a signed-in commenter account — identity comes from the account, not the request body,
// so a signed-in user can't post a comment under someone else's name/email.
router.post("/", protectUser, async (req, res) => {
  try {
    const { post, content } = req.body;
    if (!post || !content?.trim()) {
      return res.status(400).json({ message: "Comment content is required" });
    }
    const comment = await Comment.create({
      post,
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      content: content.trim(),
      status: "pending",
    });
    res.status(201).json({ message: "Comment submitted for review", comment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: get all comments
router.get("/", protect, async (req, res) => {
  try {
    const comments = await Comment.find().populate("post", "title slug").sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update status (approve/reject)
router.put("/:id", protect, async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: delete comment
router.delete("/:id", protect, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

import express from "express";
import User from "../models/User.js";
import { generateUserToken } from "../utils.js";
import { protectUser } from "../middleware/protectUser.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route POST /api/users/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateUserToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/users/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (user && (await user.matchPassword(password))) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateUserToken(user._id),
      });
    }
    res.status(401).json({ message: "Invalid email or password" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/users/me
router.get("/me", protectUser, async (req, res) => {
  res.json(req.user);
});

// ─── Admin-only routes ────────────────────────────────────────────────────────

// @route GET /api/users  (admin: list all registered users)
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/users/:id  (admin: delete a user account)
router.delete("/:id", protect, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;


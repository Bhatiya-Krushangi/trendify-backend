import express from "express";
import Admin from "../models/Admin.js";
import { generateToken } from "../utils.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: email?.toLowerCase().trim() });
    if (admin && (await admin.matchPassword(password))) {
      return res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      });
    }
    res.status(401).json({ message: "Invalid email or password" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  res.json(req.admin);
});

export default router;

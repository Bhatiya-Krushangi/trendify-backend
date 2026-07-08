import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";
import { isCloudinaryConfigured } from "../config/cloudinary.js";

const router = express.Router();

router.post("/", protect, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  // Cloudinary storage puts the CDN URL on req.file.path; local disk storage only has a filename.
  const url = isCloudinaryConfigured ? req.file.path : `/uploads/${req.file.filename}`;
  res.json({ url });
});

export default router;

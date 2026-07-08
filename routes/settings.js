import express from "express";
import Settings from "../models/Settings.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const getOrCreateSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
};

// Public: fetch site settings (safe subset served, but full doc has no secrets)
router.get("/", async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: update settings
router.put("/", protect, async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;

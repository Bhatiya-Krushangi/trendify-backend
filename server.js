import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import categoryRoutes from "./routes/categories.js";
import commentRoutes from "./routes/comments.js";
import dashboardRoutes from "./routes/dashboard.js";
import settingsRoutes from "./routes/settings.js";
import uploadRoutes from "./routes/upload.js";
import contactRoutes from "./routes/contact.js";
import translateRoutes from "./routes/translate.js";

dotenv.config();
connectDB();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Basic rate limiting for public comment/contact endpoints
const writeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
app.use("/api/comments", writeLimiter);
app.use("/api/contact", writeLimiter);
app.use("/api/users/register", writeLimiter);
app.use("/api/users/login", writeLimiter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/translate", translateRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`TrendPluse API running on port ${PORT}`));

import multer from "multer";
import path from "path";
import fs from "fs";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";

const allowedTypes = /jpeg|jpg|png|webp|gif/;

const fileFilter = (req, file, cb) => {
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error("Only image files are allowed (jpg, png, webp, gif)"));
};

let storage;

if (isCloudinaryConfigured) {
  // Images upload straight to Cloudinary — no local disk usage, works on any host (including
  // read-only/ephemeral filesystems), and gives automatic CDN delivery + transformations.
  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "trendpluse",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: [{ width: 1600, crop: "limit" }], // cap upload size, keep aspect ratio
    },
  });
  console.log("Image uploads: using Cloudinary");
} else {
  // Fallback for local development without Cloudinary credentials configured yet
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
  console.log("Image uploads: Cloudinary not configured — falling back to local disk storage");
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

export default upload;

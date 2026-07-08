import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Auth guard for public commenter accounts (separate token namespace from admin).
export const protectUser = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.type !== "user") {
        return res.status(401).json({ message: "Invalid token" });
      }
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, account not found" });
      }
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Please sign in to do that" });
};

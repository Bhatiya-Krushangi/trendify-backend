import jwt from "jsonwebtoken";

export const generateToken = (id) => {
  return jwt.sign({ id, type: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const generateUserToken = (id) => {
  return jwt.sign({ id, type: "user" }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

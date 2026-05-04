import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import userModel from "../models/userModal.js"; 

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 🔹 1. Get token from header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // 🔹 2. Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing",
    });
  }

  try {
    // 🔹 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 4. Attach user to request
    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user._id; // you were using req.user as userId ✔️
    req.userData = user; // optional full user

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
});
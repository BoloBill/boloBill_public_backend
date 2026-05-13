import admin from '../config/firebase.js';
import asyncHandler from "express-async-handler";
import userModel from "../models/userModal.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Get token from header or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // 2. Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing",
    });
  }

  try {
    // 3. Verify Firebase token (replaces jwt.verify)
    console.log(token);
    const decoded = await admin.auth().verifyIdToken(token);

    // 4. Find user in DB using email from Firebase token
    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user._id;
    req.userData = user;

    next();

  } catch (error) {
    console.log("🔥 PROTECT ERROR:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

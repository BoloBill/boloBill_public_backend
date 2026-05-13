import asyncHandler from "express-async-handler";
import admin from '../config/firebase.js';
import userModel from "../models/userModal.js";
import generateToken from "../utils/generateJwtToken.js";

export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: "Token missing",
    });
  }

  try {

    // 1. Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(idToken);

    const { uid, email, name, picture } = decoded;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email not found in token",
      });
    }

    // 2. Check if user exists
    let user = await userModel.findOne({ email });

    // 3. If not → create user
    if (!user) {
      user = await userModel.create({
        name: name || "No Name",
        email,
        avatar: picture || "",
        firebaseId: uid,
      });
    }

    // 4. Return Firebase idToken directly (no JWT needed)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: idToken,   // ✅ Firebase token used as the app token
      user,
    });

  } catch (error) {
    console.log("🔥 VERIFY ERROR FULL:", error);

    return res.status(401).json({
      success: false,
      message: error.message || "Invalid Firebase token",
    });
  }
});

// 🔹 Update user profile
export const updateAccount = asyncHandler(async (req, res) => {
  try {
    const userId = req.user;

    const {
      name,
      avatar,
      shopName,
      address,
      phone,
      email,
      gstin,
      businessCategory,
    } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (shopName !== undefined) user.shopName = shopName;
    if (address !== undefined) user.address = address;
    if (phone !== undefined) user.phone = phone;
    if (email !== undefined) user.email = email;
    if (gstin !== undefined) user.gstin = gstin;
    if (businessCategory !== undefined) user.businessCategory = businessCategory;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update account",
    });
  }
});

// 🔹 Get current user profile
export const getMe = asyncHandler(async (req, res) => {
  try {
    const userId = req.user; // set by protect middleware

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
});

// Income Graph Data Controller


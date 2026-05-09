import express from "express";
import { googleLogin, updateAccount, getMe } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Google login
router.post("/google", googleLogin);

// 🔹 Update account
router.put("/update", protect, updateAccount);

router.get("/me", protect, getMe);

export default router;
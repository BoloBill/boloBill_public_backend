import express from "express";
import {
  approveSeller,
  requestSellerApproval,
  getPendingApprovals,
} from "../controllers/approveController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Shopkeeper sends approval request
router.post("/request", requestSellerApproval);

// Admin gets all pending approval requests
router.get("/pending", getPendingApprovals);

// Admin approves a specific request
router.put("/approve",protect, approveSeller);

export default router;
import asyncHandler from "express-async-handler";
import ApprovalModel from "../models/approveModal.js";
import userModal from "../models/userModal.js";

export const approveSeller = asyncHandler(async (req, res) => {
  try {
    const { requestId } = req.body;
    
    const adminId = req.user;

    const adminUser = await userModal.findById(adminId);

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    if (adminUser.types !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admins can approve sellers",
      });
    }

    // FIND REQUEST
    const request = await ApprovalModel.findOne({ _id: requestId }).populate("shopkeeper");

    console.log("REQUEST ID:", requestId);
    console.log("REQUEST:", request);


    // IMPORTANT FIX
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Approval request not found",
      });
    }

    // NOW SAFE
    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request already processed",
      });
    }

    const user = request.shopkeeper;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Shopkeeper not found",
      });
    }

    user.approve = true;
    user.requestAdmin = false;

    await user.save();

    request.status = "approved";

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Seller approved successfully",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve seller",
      error: error.message,
    });
  }
});


export const requestSellerApproval = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModal.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.types === "admin") {
      return res.status(400).json({
        success: false,
        message: "Admin cannot request seller approval",
      });
    }

    const existingRequest = await ApprovalModel.findOne({
      shopkeeper: user._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: "Approval request already pending",
      });
    }

    const request = await ApprovalModel.create({
      shopkeeper: user._id,
      email: user.email,
      shopName: user.shopName,
      status: "pending",
    });

    user.requestAdmin = true;
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Approval request submitted",
      request,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit approval request",
      error: error.message,
    });
  }
});


export const getPendingApprovals = asyncHandler(async (req, res) => {
  const approvals = await ApprovalModel.find({ status: "pending" })
    .populate("shopkeeper", "name email shopName phone address")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: approvals.length,
    approvals,
  });
});
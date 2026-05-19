import mongoose from "mongoose";

const approveSchema = new mongoose.Schema(
  {
    shopkeeper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    shopName: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const ApprovalModel =
  mongoose.models.approvals || mongoose.model("approvals", approveSchema);

export default ApprovalModel;
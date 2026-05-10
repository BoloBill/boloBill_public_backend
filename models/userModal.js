import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    firebaseId: String,
    shopName: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    gstin: {
      type: String,
      default: '',
    },
    businessCategory: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const userModal = mongoose.models.users || mongoose.model("users", userSchema);

export default userModal;
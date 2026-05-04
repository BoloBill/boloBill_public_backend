import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: String,
    firebaseId: String,
  },
  { timestamps: true }
);
const userModal = mongoose.models.users || mongoose.model("users", userSchema);
export default userModal;
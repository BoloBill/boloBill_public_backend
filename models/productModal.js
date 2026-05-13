import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        aliases: [
            {
                type: String,
                lowercase: true,
                trim: true,
            },
        ],

        price: {
            type: Number,
            required: true,
        },

        unit: {
            type: String,
            required: true,
            enum: ["kg", "gram", "piece", "litre"],
        },

        imageUri:{
            type: String,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

    },
    { timestamps: true }
);
const productModal = mongoose.models.products || mongoose.model("products", productSchema);
export default productModal; 

productSchema.index({ name: "text", aliases: "text" });
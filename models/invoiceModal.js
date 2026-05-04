import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
    {
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                name: String, // snapshot (important)
                price: Number, // snapshot price
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
                unit: String,
                total: Number, // price * quantity
            },
        ],

        totalAmount: {
            type: Number,
            required: true,
        },

        discount: {
            type: Number,
            default: 0,
        },

        finalAmount: {
            type: Number,
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        invoiceNumber: {
            type: String,
            unique: true,
        },
        status: {
            type: String,
            enum: ["pending", "paid"],
            default: "paid",
        },
        customerName: String,
        customerPhone: String,
    },
    { timestamps: true }
);
const invoiceModal = mongoose.models.invoices || mongoose.model("invoices", invoiceSchema);
export default invoiceModal;
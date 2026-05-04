import dns from 'dns'
dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";



dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// DB Connection
connectDB();

// Routes
app.use("/api/users", userRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/products", productRoutes);

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
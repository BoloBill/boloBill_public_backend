import express from "express";
import {
  createInvoice,
  // getAllInvoices,
  getSingleInvoice,
  updateInvoice,
  deleteInvoice,
  generateBillPDF
} from "../controllers/invoiceController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createInvoice);
// router.get("/", protect, getAllInvoices);
router.get("/:id", protect, getSingleInvoice);
router.put("/:id", protect, updateInvoice);
router.delete("/:id", protect, deleteInvoice);
router.get("/:id/bill-pdf", protect, generateBillPDF);

export default router;
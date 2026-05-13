import express from "express";
import {
  createInvoice,
  getUserInvoices,
  getSingleInvoice,
  updateInvoice,
  deleteInvoice,
  generateBillPDF,
  reportSummery,
} from "../controllers/invoiceController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createInvoice);
router.get("/", protect, getUserInvoices);
router.get("/reports/summary", protect, reportSummery);
router.get("/:id", protect, getSingleInvoice);
router.put("/:id", protect, updateInvoice);
router.delete("/:id", protect, deleteInvoice);
router.get("/:id/bill-pdf", protect, generateBillPDF);

export default router;
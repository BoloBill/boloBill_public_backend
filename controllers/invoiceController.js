import asyncHandler from "express-async-handler";
import invoiceModel from "../models/invoiceModal.js";
import productModel from "../models/productModal.js";

// 🔹 Create Invoice
export const createInvoice = asyncHandler(async (req, res) => {
  try {
    const userId = req.user;
    const { products, discount = 0, customerName, customerPhone } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products provided",
      });
    }

    let totalAmount = 0;

    // 🔹 Process products
    const processedProducts = await Promise.all(
      products.map(async (item) => {
        const productData = await productModel.findById(item.product);

        if (!productData) {
          throw new Error("Product not found");
        }

        const price = productData.price;
        const quantity = item.quantity || 1;
        const total = price * quantity;

        totalAmount += total;

        return {
          product: productData._id,
          name: productData.name, // snapshot
          price,
          quantity,
          unit: productData.unit,
          total,
        };
      })
    );

    const finalAmount = totalAmount - discount;

    // 🔹 Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;

    const invoice = await invoiceModel.create({
      products: processedProducts,
      totalAmount,
      discount,
      finalAmount,
      user: userId,
      invoiceNumber,
      customerName,
      customerPhone,
    });

    res.status(201).json({
      success: true,
      message: "Invoice created",
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create invoice",
    });
  }
});

export const getSingleInvoice = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await invoiceModel.findById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching invoice",
    });
  }
});

export const updateInvoice = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await invoiceModel.findById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // only allow limited updates
    const { status, discount } = req.body;

    if (status) invoice.status = status;
    if (discount !== undefined) {
      invoice.discount = discount;
      invoice.finalAmount = invoice.totalAmount - discount;
    }

    const updated = await invoice.save();

    res.status(200).json({
      success: true,
      message: "Invoice updated",
      invoice: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update invoice",
    });
  }
});

export const deleteInvoice = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await invoiceModel.findByIdAndDelete(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete invoice",
    });
  }
});

// Generate pdf bill 
import PDFDocument from "pdfkit";

export const generateBillPDF = asyncHandler(async (req, res) => {
  const invoice = await invoiceModel.findById(req.params.id).populate("user");

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=invoice-${invoice.invoiceNumber}.pdf`
  );

  doc.pipe(res);

  // 🔹 Header
  doc.fontSize(18).text(invoice.user.shopName, { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice No: ${invoice.invoiceNumber}`);
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleString()}`);

  doc.moveDown();
  doc.text(`Customer: ${invoice.customerName || "N/A"}`);
  doc.text(`Phone: ${invoice.customerPhone || "N/A"}`);

  doc.moveDown();

  // 🔹 Table
  invoice.products.forEach((item) => {
    doc.text(
      `${item.name} - ${item.quantity} ${item.unit} x ₹${item.price} = ₹${item.total}`
    );
  });

  doc.moveDown();
  doc.text(`Total: ₹${invoice.totalAmount}`);
  doc.text(`Discount: ₹${invoice.discount}`);
  doc.text(`Final Amount: ₹${invoice.finalAmount}`);

  doc.moveDown();
  doc.text("Thank you!", { align: "center" });

  doc.end();
});
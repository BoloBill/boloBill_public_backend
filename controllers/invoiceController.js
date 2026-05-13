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

// get all invoices for a user
export const getUserInvoices = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const invoices = await invoiceModel
      .find({ user: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
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


export const reportSummery = asyncHandler(async (req, res) => {
  try {
    const userId = req.user;

    const invoices = await invoiceModel.find({ user: userId }).lean();

    if (!invoices || invoices.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalRevenue: 0,
          totalInvoices: 0,
          topProduct: '',
          topProductUnits: 0,
          revenueGrowth: 0,
          invoiceGrowth: 0,
        },
      });
    }

    const totalInvoices = invoices.length;

    const totalRevenue = invoices.reduce((sum, invoice) => {
      return sum + Number(invoice.totalAmount || invoice.grandTotal || invoice.total || 0);
    }, 0);

    const productMap = {};

    invoices.forEach(invoice => {
      const items = invoice.items || invoice.products || [];

      items.forEach(item => {
        const name =
          item.name ||
          item.productName ||
          item.title ||
          item?.product?.name ||
          'Unknown Product';

        const quantity = Number(item.quantity || item.qty || 0);

        if (!productMap[name]) {
          productMap[name] = 0;
        }

        productMap[name] += quantity;
      });
    });

    let topProduct = '';
    let topProductUnits = 0;

    Object.entries(productMap).forEach(([name, units]) => {
      if (units > topProductUnits) {
        topProduct = name;
        topProductUnits = units;
      }
    });

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const currentMonthInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      return invoiceDate >= currentMonthStart;
    });

    const previousMonthInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      return invoiceDate >= previousMonthStart && invoiceDate <= previousMonthEnd;
    });

    const currentMonthRevenue = currentMonthInvoices.reduce((sum, invoice) => {
      return sum + Number(invoice.totalAmount || invoice.grandTotal || invoice.total || 0);
    }, 0);

    const previousMonthRevenue = previousMonthInvoices.reduce((sum, invoice) => {
      return sum + Number(invoice.totalAmount || invoice.grandTotal || invoice.total || 0);
    }, 0);

    const currentMonthInvoiceCount = currentMonthInvoices.length;
    const previousMonthInvoiceCount = previousMonthInvoices.length;

    const revenueGrowth =
      previousMonthRevenue === 0
        ? currentMonthRevenue > 0
          ? 100
          : 0
        : ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

    const invoiceGrowth =
      previousMonthInvoiceCount === 0
        ? currentMonthInvoiceCount > 0
          ? 100
          : 0
        : ((currentMonthInvoiceCount - previousMonthInvoiceCount) / previousMonthInvoiceCount) * 100;

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalInvoices,
        topProduct,
        topProductUnits,
        revenueGrowth: Number(revenueGrowth.toFixed(1)),
        invoiceGrowth: Number(invoiceGrowth.toFixed(1)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate report',
    });
  }
});
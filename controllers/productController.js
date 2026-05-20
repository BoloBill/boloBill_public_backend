import productModal from "../models/productModal.js";
import asyncHandler from 'express-async-handler';


const addProduct = asyncHandler( async (req,res)=>{
     try {
         const userId = req.user;
         const {name,aliases,price,unit} = req.body;

         const existingProduct = await productModal.findOne({ name, userId });

         if (existingProduct) {
            return res.status(400).json({message:"Product with the same name already exists",success:false});
         }

         const product = await productModal.create({
            name,
            aliases,
            price,
            unit,
            userId
         });

         product.save();

         const allProduct = await productModal.find({userId:userId});

         res.status(200).json({message:"Product Successfully added",success:true,products:allProduct})


     } catch (error) {
        res.status(500).json({message:"cannot add product",success:false});
     }
})

// Get all product
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const userId = req.user;

    const products = await productModal.find({ userId });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

// get single product
const getSingleProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModal.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product",
    });
  }
});

// update product
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, aliases, price, unit } = req.body;

    const updatedProduct = await productModal.findByIdAndUpdate(
      id,
      { name, aliases, price, unit },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
});

// delete product
const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await productModal.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
});


export {addProduct,deleteProduct,updateProduct,getAllProducts,getSingleProduct};
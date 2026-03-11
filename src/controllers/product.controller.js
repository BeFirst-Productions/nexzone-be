import { cloudinary } from "../config/cloudinary.js";
import products from "../models/products.js";


// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    console.log(req.body);
    
    const images =
      req.files?.map((file) => ({
        url: file.path,
        public_id: file.filename,
      })) || [];

    const product = await products.create({
      ...req.body, // category will come here
      images,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};



// GET PRODUCTS (Pagination + Category Populate)
export const getProducts = async (req, res) => {
  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const filter = {};

    // filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const [productList, totalProducts] = await Promise.all([
      products.find(filter)
        .populate("category", "name slug")
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),

      products.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total: totalProducts,
      page,
      totalPages: Math.ceil(totalProducts / limit),
      data: productList,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};



// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {

    const product = await products.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    for (let img of product.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product deleted",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};



// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {

    const product = await products.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let newImages = [];

    if (req.files && req.files.length > 0) {
      newImages = req.files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    // merge old + new images
    const updatedImages = [...product.images, ...newImages];

    const updatedProduct = await products.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        images: updatedImages,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};



// GET PRODUCT BY ID
export const getProductById = async (req, res) => {
  try {

    const product = await products
      .findById(req.params.id)
      .populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};
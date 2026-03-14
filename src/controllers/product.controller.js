import { cloudinary } from "../config/cloudinary.js";
import products from "../models/products.js";
import Category from "../models/category.js";


// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    
    
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

    if (req.query.category) {

      // find subcategories
      const subCategories = await Category.find({
        parent: req.query.category
      }).select("_id");

      const categoryIds = [
        req.query.category,
        ...subCategories.map(c => c._id)
      ];

      filter.category = { $in: categoryIds };
    }

    const [productList, totalProducts] = await Promise.all([
      products.find(filter)
        .populate({
          path: "category",
          select: "name slug parent",
          populate: {
            path: "parent",
            select: "name slug"
          }
        })
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

export const getRecentProducts = async (req, res) => {
  try {

    const recentProducts = await products
      .find({})
      .populate("category", "name slug parent")
      .sort({ createdAt: -1 }) // newest first
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      data: recentProducts,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch recent products",
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

    // Parse the list of existing image URLs the frontend wants to keep
    let keptImageUrls = [];
    if (req.body.existingImages) {
      try {
        keptImageUrls = JSON.parse(req.body.existingImages);
      } catch {
        keptImageUrls = [];
      }
    }

    // Figure out which old images were removed by the user
    const removedImages = product.images.filter(
      (img) => !keptImageUrls.includes(img.url)
    );

    // Delete removed images from Cloudinary
    for (const img of removedImages) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // Keep only the images the frontend still wants
    const keptImages = product.images.filter((img) =>
      keptImageUrls.includes(img.url)
    );

    // Append any newly uploaded images
    const newImages = (req.files || []).map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    const finalImages = [...keptImages, ...newImages];

    // Remove existingImages from req.body so it doesn't get saved as a field
    const { existingImages, ...bodyWithoutExisting } = req.body;

    const updatedProduct = await products.findByIdAndUpdate(
      req.params.id,
      {
        ...bodyWithoutExisting,
        images: finalImages,
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
      .populate("category", "name slug parent");

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

// SEARCH PRODUCTS
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchRegex = new RegExp(query, "i"); // Case-insensitive search

    const searchResults = await products.find({
      $or: [
        { name: searchRegex },
        { shortDescription: searchRegex },
        { description: searchRegex },
      ],
    }).populate("category", "name slug parent");

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: searchResults,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to search products",
      error: error.message,
    });
  }
};
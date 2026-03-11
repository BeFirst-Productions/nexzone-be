import Category from "../models/category.js";

const slugify = (text) =>
  text.toLowerCase().trim().replace(/\s+/g, "-");


/* ================================
   CREATE CATEGORY / SUBCATEGORY
================================ */
export const createCategory = async (req, res) => {
  try {

    const { name, parent, code, order } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const slug = slugify(name);

    // Auto-generate code
    let finalCode = "";
    if (parent) {
      // Subcategory logic: PREFIX-01
      const parentCat = await Category.findById(parent);
      if (!parentCat) {
        return res.status(404).json({ success: false, message: "Parent category not found" });
      }

      const prefix = parentCat.name.substring(0, 3).toUpperCase();
      const subCount = await Category.countDocuments({ parent });
      finalCode = `${prefix}-${String(subCount + 1).padStart(2, '0')}`;

      // Ensure absolute uniqueness (edge case if subcategories were deleted)
      let isUnique = false;
      let counter = subCount + 1;
      while (!isUnique) {
        const existing = await Category.findOne({ code: finalCode });
        if (existing) {
          counter++;
          finalCode = `${prefix}-${String(counter).padStart(2, '0')}`;
        } else {
          isUnique = true;
        }
      }
    } else {
      // Main category logic: PREFIX
      finalCode = name.substring(0, 3).toUpperCase();

      // Handle collision for main categories (e.g., Canon vs Canton)
      let isUnique = false;
      let suffix = 1;
      let tempCode = finalCode;
      while (!isUnique) {
        const existing = await Category.findOne({ code: tempCode });
        if (existing) {
          tempCode = `${finalCode}${suffix}`;
          suffix++;
        } else {
          isUnique = true;
          finalCode = tempCode;
        }
      }
    }

    const category = await Category.create({
      name,
      slug,
      code: finalCode,
      parent: parent || null,
      order: order || 0
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });

  } catch (error) {

    if (error.code === 11000) {

      const duplicateField = Object.keys(error.keyValue)[0];

      if (duplicateField === "name") {
        return res.status(400).json({
          success: false,
          message: "Category name already exists"
        });
      }

      if (duplicateField === "slug") {
        return res.status(400).json({
          success: false,
          message: "Category slug already exists"
        });
      }

      if (duplicateField === "code") {
        return res.status(400).json({
          success: false,
          message: "Category code already exists"
        });
      }

      return res.status(400).json({
        success: false,
        message: "Duplicate category detected"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message
    });

  }
};



/* ================================
   UPDATE CATEGORY
================================ */
export const updateCategory = async (req, res) => {
  try {

    const { name, parent, code, order } = req.body;

    const slug = slugify(name);

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        slug,
        code,
        parent: parent || null,
        order
      },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message
    });

  }
};



/* ================================
   GET CATEGORIES (Pagination)
================================ */
export const getCategories = async (req, res) => {
  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [categories, totalCategories] = await Promise.all([
      Category.find()
        .populate("parent", "name slug")
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit),

      Category.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      total: totalCategories,
      page,
      totalPages: Math.ceil(totalCategories / limit),
      data: categories
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message
    });

  }
};



/* ================================
   GET CATEGORY BY ID
================================ */
export const getCategoryById = async (req, res) => {
  try {

    const category = await Category.findById(req.params.id)
      .populate("parent", "name slug");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    const subcategories = await Category
      .find({ parent: category._id })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: {
        category,
        subcategories
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message
    });

  }
};



/* ================================
   DELETE CATEGORY
================================ */
export const deleteCategory = async (req, res) => {
  try {

    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    await Category.deleteMany({ parent: categoryId });

    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({
      success: true,
      message: "Category and its subcategories deleted successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message
    });

  }
};



/* ================================
   GET ALL CATEGORIES (TREE)
================================ */
export const getAllCategories = async (req, res) => {
  try {

    const categories = await Category
      .find({ parent: null })
      .sort({ order: 1 })
      .lean();

    for (let category of categories) {
      category.subcategories = await Category
        .find({ parent: category._id })
        .sort({ order: 1 });
    }

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message
    });

  }
};



/* ================================
   UPDATE CATEGORY ORDER (Drag & Drop)
================================ */
export const updateCategoryOrder = async (req, res) => {
  try {

    const { categories } = req.body;

    const bulkOps = categories.map((cat) => ({
      updateOne: {
        filter: { _id: cat.id },
        update: { order: cat.order }
      }
    }));

    await Category.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Category order updated successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Failed to update category order",
      error: error.message
    });

  }
};
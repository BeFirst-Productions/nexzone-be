import express from "express";
import { createCategory, deleteCategory, getAllCategories, getCategories, getCategoryById, updateCategory, updateCategoryOrder } from "../../controllers/category.controller.js";
import protect from "../../middlewares/auth.middleware.js";

const categoryRouter = express.Router();

categoryRouter.post("/add-category", protect, createCategory);
categoryRouter.get("/get-categories", getCategories);
categoryRouter.get("/get-all-categories", getAllCategories);
categoryRouter.get("/get-category/:id", getCategoryById);
categoryRouter.put("/update-category/:id", protect, updateCategory);
categoryRouter.patch("/update-order", protect, updateCategoryOrder);
categoryRouter.delete("/delete-category/:id", protect, deleteCategory);


export default categoryRouter;
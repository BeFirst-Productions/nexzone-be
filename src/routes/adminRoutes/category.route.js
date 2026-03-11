import express from "express";
import { createCategory, deleteCategory, getAllCategories, getCategories, getCategoryById, updateCategory, updateCategoryOrder } from "../../controllers/category.controller.js";
const categoryRouter = express.Router();

categoryRouter.post("/add-category", createCategory);
categoryRouter.get("/get-categories", getCategories);
categoryRouter.get("/get-all-categories", getAllCategories);
categoryRouter.get("/get-category/:id", getCategoryById);
categoryRouter.put("/update-category/:id", updateCategory);
categoryRouter.patch("/update-order", updateCategoryOrder);
categoryRouter.delete("/delete-category/:id", deleteCategory);

export default categoryRouter;
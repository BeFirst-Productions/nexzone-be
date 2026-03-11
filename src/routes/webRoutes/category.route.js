import express from "express";
import { getAllCategories, getCategories, getCategoryById } from "../../controllers/category.controller.js";

const categoryRouter = express.Router();

// Public routes for website
categoryRouter.get("/get-categories", getCategories);
categoryRouter.get("/get-all-categories", getAllCategories);
categoryRouter.get("/get-category/:id", getCategoryById);

export default categoryRouter;

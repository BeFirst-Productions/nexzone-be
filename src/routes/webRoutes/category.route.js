import express from "express";
import { getAllCategories, getCategories, getCategoryById } from "../../controllers/category.controller.js";

const categoryRouter = express.Router();


categoryRouter.get("/get-all-categories", getAllCategories);

export default categoryRouter;

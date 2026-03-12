import express from "express";
import { getAccessoriesSubcategories, getAllCategories} from "../../controllers/category.controller.js";

const categoryRouter = express.Router();


categoryRouter.get("/get-all-categories", getAllCategories);
categoryRouter.get("/accessories", getAccessoriesSubcategories);

export default categoryRouter;

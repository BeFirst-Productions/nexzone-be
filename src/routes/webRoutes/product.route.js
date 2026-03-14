import express from "express";
import {
  getProducts,
  getProductById,
  getRecentProducts,
  searchProducts,
} from "../../controllers/product.controller.js";

const productRouter = express.Router();

productRouter.get("/get-products", getProducts);
productRouter.get("/get-product/:id", getProductById);
productRouter.get("/recent-products", getRecentProducts);   
productRouter.get("/search", searchProducts);

export default productRouter;
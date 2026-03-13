import express from "express";
import {
  getProducts,
  getProductById,
  getRecentProducts,
} from "../../controllers/product.controller.js";

const productRouter = express.Router();

productRouter.get("/get-products", getProducts);
productRouter.get("/get-product/:id", getProductById);
productRouter.get("/recent-products", getRecentProducts);   


export default productRouter;
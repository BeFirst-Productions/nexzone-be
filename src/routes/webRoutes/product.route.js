import express from "express";
import {
  getProducts,
  getProductById,
} from "../../controllers/product.controller.js";

const productRouter = express.Router();

productRouter.get("/get-products", getProducts);
productRouter.get("/get-product/:id", getProductById);

export default productRouter;
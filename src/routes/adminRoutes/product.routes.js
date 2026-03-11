import express from "express";
import multer from "multer";
import { storage } from "../../config/cloudinary.js";
import protect from "../../middlewares/auth.middleware.js";
import {
  createProduct,
  getProducts,
  deleteProduct,
  getProductById,
  updateProduct,
} from "../../controllers/product.controller.js";

const productRouter = express.Router();
const upload = multer({ storage });

productRouter.post("/add-product", upload.array("images", 5), createProduct);
productRouter.get("/get-products", getProducts);
productRouter.get("/get-product/:id", getProductById);
productRouter.put("/update-product/:id",upload.array("images", 5), updateProduct);
productRouter.delete("/delete-product/:id", deleteProduct);

export default productRouter;
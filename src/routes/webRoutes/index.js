import express from "express";
import categoryRouter from "./category.route.js";
import productRouter from "./product.route.js";

const webRouter = express.Router();

webRouter.use("/category", categoryRouter); 
webRouter.use("/product", productRouter); 

export default webRouter;

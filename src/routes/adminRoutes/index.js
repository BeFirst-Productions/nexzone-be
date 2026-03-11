import express from "express";
import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import productRouter from "./product.routes.js";
import categoryRouter from "./category.route.js";

const adminRouter = express.Router();

adminRouter.use("/auth", authRouter);
adminRouter.use("/user", userRouter);
adminRouter.use("/product", productRouter);
adminRouter.use("/category", categoryRouter);

export default adminRouter;
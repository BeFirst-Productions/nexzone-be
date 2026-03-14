import express from "express";
import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import productRouter from "./product.routes.js";
import categoryRouter from "./category.route.js";
import accessoryRouter from "./accessory.routes.js";
import protect from "../../middlewares/auth.middleware.js";


const adminRouter = express.Router();

adminRouter.use("/auth", authRouter);
adminRouter.use("/user", protect, userRouter);
adminRouter.use("/product", protect, productRouter);
adminRouter.use("/category", protect, categoryRouter);
adminRouter.use("/accessory", protect, accessoryRouter);


export default adminRouter;
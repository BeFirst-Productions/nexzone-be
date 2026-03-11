import express from "express";
import categoryRouter from "./category.route.js";

const webRouter = express.Router();

webRouter.use("/category", categoryRouter);

export default webRouter;

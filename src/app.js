import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import productRoutes from "./routes/adminRoutes/product.routes.js";
import adminRouter from "./routes/adminRoutes/index.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", 
    credentials: true,
  })
);

app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api/admin", adminRouter);
app.use("/api/products", productRoutes);

export default app;
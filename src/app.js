import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import adminRouter from "./routes/adminRoutes/index.js";
import webRouter from "./routes/webRoutes/index.js";

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
app.use("/api/web", webRouter);

export default app;
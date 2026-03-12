import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import adminRouter from "./routes/adminRoutes/index.js";
import webRouter from "./routes/webRoutes/index.js";

const app = express();

// Read CORS origins from env
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

app.use("/v1/api/admin", adminRouter);
app.use("/v1/api/web", webRouter);

export default app;
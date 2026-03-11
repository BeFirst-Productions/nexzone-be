import express from "express";
import { loginAdmin, refreshToken } from "../../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/login", loginAdmin);
authRouter.post("/refresh", refreshToken);

export default authRouter;
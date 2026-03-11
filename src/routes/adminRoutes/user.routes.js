import express from "express";
import { deleteAdmin, getAdmins, registerAdmin, updateAdmin } from "../../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/register", registerAdmin);
userRouter.get("/all-users", getAdmins);
userRouter.patch("/edit-user/:id", updateAdmin);
userRouter.delete("/delete-user/:id", deleteAdmin);

export default userRouter;
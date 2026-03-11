import express from "express";
import { deleteAdmin, getAdmins, registerAdmin, updateAdmin } from "../../controllers/user.controller.js";
import protect from "../../middlewares/auth.middleware.js";


const userRouter = express.Router();

userRouter.post("/register", protect, registerAdmin);
userRouter.get("/all-users", protect, getAdmins);
userRouter.patch("/edit-user/:id", protect, updateAdmin);
userRouter.delete("/delete-user/:id", protect, deleteAdmin);


export default userRouter;
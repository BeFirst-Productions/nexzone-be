import express from "express";
import multer from "multer";
import { storage } from "../../config/cloudinary.js";
import protect from "../../middlewares/auth.middleware.js";
import {
  createAccessory,
  getAccessories,
  getAccessoryById,
  updateAccessory,
  deleteAccessory,
} from "../../controllers/accessory.controller.js";

const accessoryRouter = express.Router();
const upload = multer({ storage });

accessoryRouter.post("/add-accessory", protect, upload.array("images", 5), createAccessory);
accessoryRouter.get("/get-accessories", getAccessories);
accessoryRouter.get("/get-accessory/:id", getAccessoryById);
accessoryRouter.put("/update-accessory/:id", protect, upload.array("images", 5), updateAccessory);
accessoryRouter.delete("/delete-accessory/:id", protect, deleteAccessory);

export default accessoryRouter;

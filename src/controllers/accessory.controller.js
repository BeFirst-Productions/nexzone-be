import { cloudinary } from "../config/cloudinary.js";
import Accessory from "../models/accessory.js";

// ─── CREATE ACCESSORY ───────────────────────────────────────────────────────
export const createAccessory = async (req, res) => {
  try {
    const images =
      req.files?.map((file) => ({
        url: file.path,
        public_id: file.filename,
      })) || [];

    const accessory = await Accessory.create({
      ...req.body,
      images,
    });

    res.status(201).json({
      success: true,
      message: "Accessory created successfully",
      data: accessory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create accessory",
      error: error.message,
    });
  }
};

// ─── GET ACCESSORIES (Pagination) ────────────────────────────────────────────
export const getAccessories = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const [accessoryList, total] = await Promise.all([
      Accessory.find()
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 }),

      Accessory.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: accessoryList,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch accessories",
      error: error.message,
    });
  }
};

// ─── GET ACCESSORY BY ID ────────────────────────────────────────────────────
export const getAccessoryById = async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);

    if (!accessory) {
      return res
        .status(404)
        .json({ success: false, message: "Accessory not found" });
    }

    res.status(200).json({ success: true, data: accessory });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch accessory",
      error: error.message,
    });
  }
};

// ─── UPDATE ACCESSORY ───────────────────────────────────────────────────────
export const updateAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);

    if (!accessory) {
      return res
        .status(404)
        .json({ success: false, message: "Accessory not found" });
    }

    // Parse kept image URLs from frontend
    let keptImageUrls = [];
    if (req.body.existingImages) {
      try {
        keptImageUrls = JSON.parse(req.body.existingImages);
      } catch {
        keptImageUrls = [];
      }
    }

    // Delete removed images from Cloudinary
    const removedImages = accessory.images.filter(
      (img) => !keptImageUrls.includes(img.url)
    );
    for (const img of removedImages) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    const keptImages = accessory.images.filter((img) =>
      keptImageUrls.includes(img.url)
    );

    const newImages = (req.files || []).map((file) => ({
      url: file.path,
      public_id: file.filename,
    }));

    const { existingImages, ...bodyWithoutExisting } = req.body;

    const updated = await Accessory.findByIdAndUpdate(
      req.params.id,
      { ...bodyWithoutExisting, images: [...keptImages, ...newImages] },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Accessory updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update accessory",
      error: error.message,
    });
  }
};

// ─── DELETE ACCESSORY ───────────────────────────────────────────────────────
export const deleteAccessory = async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);

    if (!accessory) {
      return res
        .status(404)
        .json({ success: false, message: "Accessory not found" });
    }

    for (const img of accessory.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    await accessory.deleteOne();

    res.json({ success: true, message: "Accessory deleted" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete accessory",
      error: error.message,
    });
  }
};

// ─── SEARCH ACCESSORIES ─────────────────────────────────────────────────────
export const searchAccessories = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    const regex = new RegExp(query, "i");

    const results = await Accessory.find({
      $or: [
        { name: regex },
        { shortDescription: regex },
        { description: regex },
      ],
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to search accessories",
      error: error.message,
    });
  }
};

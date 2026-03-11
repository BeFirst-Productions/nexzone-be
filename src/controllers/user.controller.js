import Admin from "../models/admin.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import mongoose from "mongoose";
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1️⃣ Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // 2️⃣ Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create admin
    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    // 5️⃣ Send response
    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        token: generateToken(newAdmin._id),
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getAdmins = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const totalAdmins = await Admin.countDocuments();

    const admins = await Admin.find()
      .select("-password")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: totalAdmins,
      page,
      totalPages: Math.ceil(totalAdmins / limit),
      data: admins,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


export const updateAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const adminId = req.params.id;

    // 1️⃣ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ message: "Invalid admin ID" });
    }

    // 2️⃣ Find admin
    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // 3️⃣ Check email duplication
    if (email && email !== admin.email) {
      const emailExists = await Admin.findOne({ email });

      if (emailExists) {
        return res.status(400).json({
          message: "Email already in use",
        });
      }

      admin.email = email;
    }

    // 4️⃣ Update name
    if (name) {
      admin.name = name;
    }

    // 5️⃣ Update password
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin.password = hashedPassword;
    }

    // 6️⃣ Allow role change only for superadmin
    if (role && req.admin?.role === "superadmin") {
      admin.role = role;
    }

    // 7️⃣ Save changes
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


export const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;

    const admin = await Admin.findById(adminId);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Prevent deleting yourself
    if (req.admin && adminId === req.admin._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete yourself",
      });
    }

    await Admin.findByIdAndDelete(adminId);

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};
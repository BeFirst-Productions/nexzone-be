import jwt from "jsonwebtoken";
import admin from "../models/admin.js";

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await admin.findById(decoded.id).select("-password");
    next();
  } else {
    res.status(401).json({ message: "Not authorized" });
  }
};

export default protect;
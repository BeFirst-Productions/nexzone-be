import mongoose from "mongoose";

const accessorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    shortDescription: {
      type: String,
      required: true,
    },

    description: String,

    price: {
      type: Number,
      min: 0,
    },

    images: [
      {
        url: String,
        public_id: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Accessory", accessorySchema);


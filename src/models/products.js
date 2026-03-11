import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },

    shortDescription: { 
      type: String, 
      required: true 
    },

    description: String,

    price: {
      type: Number,
      min: 0,
      index: true
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    specifications: {
      type: Map,
      of: String,
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

// optional index (already defined in price)
productSchema.index({ price: 1 });

export default mongoose.model("Product", productSchema);
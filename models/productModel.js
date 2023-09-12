const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  brand: {
    type: String,
  },
  description: {
    type: String,
  },
  type: {
    type: String,
  },
  stock: {
    type: Number,
  },
  quantities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quantity",
    },
  ],
  images: {
    type: Array,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  orginalPrice:{
    type: Number,
  },
  price: {
    type: Number,
  },

  is_listed: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Product", productSchema);

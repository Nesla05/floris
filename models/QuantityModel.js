const mongoose = require("mongoose");

var quantitySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantities: [
    {
      size: Number,
      productPrice: Number,
      stock: Number,
    },
  ],
});

module.exports = mongoose.model("Quantity", quantitySchema);

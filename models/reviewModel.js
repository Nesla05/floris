const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  
  review: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
      rating: {
        type: Number,
      },
      review: {
        type: String,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Review", reviewSchema);

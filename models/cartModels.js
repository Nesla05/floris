const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deliveryFee: {
      type: String,
      // required:true,
    },
    gstAmount: {
      type: Number,
      // required:true,
    },
    total: {
      type: Number,
      required: true,
      default: 0,
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantityId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Quantity",
        },
        stock: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    coupon :{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    couponAmount: {
      type: mongoose.Schema.Types.ObjectId,
      type:Number,
      ref: "Coupon",
    },
    
    totalPrice :{
      type: Number,
     
    }
  },
  { timestamps: true },
);

const cart = new mongoose.model("Cart", cartSchema);
module.exports = cart;

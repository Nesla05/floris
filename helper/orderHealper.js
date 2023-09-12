const mongoose = require("mongoose");

const Order = require("../models/orderModel");
const Cart = require("../models/cartModels");
const Product = require("../models/productModel");

module.exports = {
  generateRazorpay: (orderDetails) => {
    return new Promise((resolve, reject) => {
      try {
        var instance = new Razorpay({
          key_id: process.env.RAZOR_KEY_ID,
          key_secret: process.env.RAZOR_SECRET_KEY,
        });

        let options = {
          amount: orderDetails.totalAmount * 100,
          currency: "INR",
          receipt: String(orderDetails.orderId),
        };
        instance.orders.create(options, (err, order) => {
          console.log(order);
          resolve(order);
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  verifyPayment: (paymentDetails) => {
    return new Promise((resolve, reject) => {
      try {
        let hmac = crypto.createHmac("sha256", process.env.RAZOR_SECRET_KEY);
        hmac.update(
          paymentDetails.razorpay_order_id +
            "|" +
            paymentDetails.razorpay_payment_id,
        );
        hmac = hmac.digest("hex");
        if (hmac == paymentDetails.razorpay_signature) {
          resolve();
        } else {
          reject();
        }
      } catch (error) {}
    });
  },
};

const mongoose = require("mongoose");

var addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deliveryAddress: [
      {
        name: {
          type: String,
        },
        mobile: {
          type: String,
        },
        email: {
          type: String,
        },
        houseName: {
          type: String,
        },
        district: {
          type: String,
        },
        state: {
          type: String,
        },
        pincode: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Address", addressSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_blocked: {
    type: Number,
    default: false,
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
});

module.exports = mongoose.model("User", userSchema);

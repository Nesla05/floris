const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
var couponSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    name:{
        type:String,
        required:true,
        unique:true,
    },
    minPurchase: {
        type: String,
    },
    discount: {
        type:String
    },
    maxDiscount: {
        type:String
    },
    expiry: {
        type:String
    },
    isActive: {
        type: Boolean,
        default:true
    }
});

//Export the model
module.exports = mongoose.model('Coupon', couponSchema);
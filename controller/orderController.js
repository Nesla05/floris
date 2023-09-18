const Cart = require("../models/cartModels");
const Product = require("../models/productModel");
const User = require("../models/userModels");
const Coupon = require('../models/couponModel')
const Order = require("../models/orderModel");
const Razorpay = require("razorpay");
//......user......

const payment = async (req, res) => {
  try {
    const id = req.query.id;
    const user_id = req.session.user?._id;
    const Users = await User.findById(user_id);
    const cart = await Cart.findOne({ userId: user_id });
    const user = await User.findOne(
      { _id: user_id },
      { deliveryAddress: { $elemMatch: { _id: id } } },
    );
    // Move the declaration of 'address' outside the 'if' block to access it later
    let address;
    if (user) {
      address = user.deliveryAddress?.[0];
    }

    // Rest of the code remains the same
    // You can now use the 'address' variable in the code below

    res.render("payment", { Users, cart, address ,user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Some Error occurred");
  }
};

const createOrder = async (req, res) => {
  try {
    console.log(req.body, "hiiii");
    const user_id = req.session.user?._id;

    // Receive the payment_method and addressId from the frontend form
    const { payment_method, selectedAddressId } = req.body;

    const cart = await Cart.findOne({ userId: user_id }).populate(
      "products.productId",
    );
    const items = cart.products.map((item) => {
      const product = item.productId;
      const stock = item.stock;
      const price = product.price;
      if (!price) {
        throw new Error("Product price is required");
      }
      if (!product) {
        throw new Error("Product is required");
      }
      return {
        product: product._id,
        stock: stock,
        price: price,
      };
    });

    items.forEach(async (item) => {
      const pro = await Product.findById(item.product);
      const quan = pro.stock - item.stock;
      await Product.findByIdAndUpdate(item.product, { stock: quan });
    });

    let totalPrice = cart.total;
    const order = new Order({
      user: user_id,
      items: items,
      total: totalPrice,
      status: "Pending",
      payment_method: payment_method,
      createdAt: new Date(),
    });

    let options = {
      amount: totalPrice * 100, // amount in the smallest currency unit (example: 70000 paise = 700 INR)
      currency: "INR",
      // Add more options as needed
    };

    const orders = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      payment: {
        order_id: order.user,
        currency: "INR",
        amount: order.total * 100,
      },
      paymentMethod: "Razorpay",
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error creating order" });
  }
};
// placeOrder

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const { ObjectId } = require("mongodb");
const placeOrder = async (req, res) => {
 
  try {
    const id = req.query.id;
    const user_id = req.session.user?._id;
    const user = await User.findById(user_id);
    const payment_method = req.body.payment_method;
    console.log("testing",payment_method);

    const addressIndex = user.deliveryAddress.findIndex((item) => item._id.equals(id));

    const specifiedAddress = user.deliveryAddress[addressIndex];

    const cart = await Cart.findOne({ userId: user_id }).populate(
      "products.productId"
    );

    const items = cart.products.map((item) => {
      const product = item.productId;
      const stock = item.stock;
      const price = product.price;

      if (!price) {
        throw new Error("Product price is required");
      }
      if (!product) {
        throw new Error("Product is required");
      }

      return {
        product: product._id,
        stock: stock,
        price: price,
      };
    });

    console.log(items);

    items.forEach(async (item) => {
      const pro = await Product.findById(item.product);
      const quan = pro.stock - item.stock;
      await Product.findByIdAndUpdate(item.product, { stock: quan });
    });

    let totalPrice = cart.total;
    const order = new Order({
      user: user_id,
      items: items,
      // discount: cart.discount,
      total: totalPrice,
      status: "Pending",
      payment_method: payment_method,
      createdAt: new Date(),
      // shipping_charge: 50,
      address: specifiedAddress,
    });
    await order.save();

    if (payment_method === "wallet") {
      const Twallet = user.totalWallet - totalPrice;
      await User.findByIdAndUpdate(user_id, { totalWallet: Twallet });
    }

    if (payment_method === "COD" || payment_method === "wallet" ) {
  

      
      await Cart.deleteOne({ userId: user_id });

      res.render("confirm", { user, user_id, order, specifiedAddress, cart });

   }  else if (payment_method === "razorpay") {
    
    await Cart.deleteOne({ userId: user_id });
  
    console.log( "optionssssss");
    const options = {
      amount: totalPrice * 100, // Amount in paise (Indian currency)
      currency: "INR",
      receipt: user_id,

      
    };
   
    // console.log(options, "optionssssss");
    const order = await razorpay.orders.create(options);
  }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message || "An error occurred while processing the order",
    });
  }
};


const IsOrderComplete = async (req, res) => {
  razorpay.payments
    .fetch(req.body.razorpay_payment_id)
    .then((paymentDocument) => {
      if (paymentDocument.status === "Pending") {
        res.send("payment succesfull");
      } else {
        res.redirect("/checkout");
      }
    });
};
const wallet = async (req , res) =>{
 
  try{
    const id= req.query.id;
    const user_id = req.session.user?._id;
    const user = await User.findById(user_id);
    const orderrefund= await Order.find({
        user:user_id,
        status:"Refunded"
    });

    const order_data = await Order.find({
      user: user_id,
      payment_method: "wallet"
    });
   
    res.render('wallet',{user,order_data,orderrefund})
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating a create operation",
    });
  }
  
}
const confirmRazorpay = async (req, res) => {
  try {
    const user_id = req.session.user?._id;

    const user = await User.findById(user_id);

    res.render("confirms", { user, user_id });
  } catch (error) {
    console.log(error);
  }
};
// user cancel order
const ordercancel = async (req, res) => {
  try {
    const orderId = req.query.id;
    const user_id = req.session.user?._id;
    const user = await User.findById(user_id);
    const reason = req.body.reason;
    const cancelled = "cancelled";
    const orda = await Order.findById(orderId);
    // Update the order using findByIdAndUpdate
    await Order.findByIdAndUpdate(orderId, {
      status: cancelled,
      reason: reason,
    });
    const order_data = await Order.find({ user: orda.user })
      .populate("items.product")
      .populate("items.stock");
    res.render("user-order", { order_data, user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const user_order = async (req, res) => {
  try {
    const id = req.query.id;

    const order_data = await Order.find({ user: id })
      .populate("items.product")
      .populate("items.stock");
    const user = await User.findById({ _id: id });

    res.render("user-order", {
      order_data,
      user,
    });
  } catch (error) {
    console.error(error);
    res.send({ message: error.message });
  }
};


const user_orderdetailspage = async (req, res) => {
  try {
    const id = req.query.id;
    const user = req.session.user; // Assuming you have the user session stored
    const order_data = await Order.findOne({ _id: id })
      .populate("user")
      .populate("items.product")
      .populate("items.stock");
console.log(order_data.items ,'hhhhhhhhhhhhhhhhhhhhhh');
    if (!order_data) {
      // Handle case when order is not found
      return res.status(404).send("Order not found");
    }
    const orderId = req.query.id;
    const order = await Order.findById(orderId);
    let coupon = ''
    if (order.couponAmount !== '') {
      coupon = await Coupon.findById(order.coupon)
    }

    res.render("user-orderDetails", { 
      order_data,
       user,
      order,
      coupon
     });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// admin order management
const orderStatus = async (req, res) => {
  try {
    const order_data = await Order.find().populate("user").populate("items.product").populate("items.stock")
    
    

    res.render("orderStatus", {
      order_data
      
    });
  } catch (error) {
    console.error(error);
    res.send({ message: error.message });
  }
};

// order update
const orderUpdate = async (req, res) => {
  try {
    const orderId = req.query.id;

    const newStatus = req.body.status;
    // Update the order using findByIdAndUpdate
    await Order.findByIdAndUpdate(orderId, { status: newStatus });

    res.redirect("/order");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// order details
const orderdetail = async (req, res) => {
  try {
    const id = req.query.id;

    const order_data = await Order.findOne({ _id: id })
      .populate("user")
      .populate("items.product")
      .populate("items.stock");
    res.render("orderDetails", { order_data });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const orderReturn = async (req , res) =>{
  try{
    console.log('testinggg');
    
    const user = req.session.user;
    const orderId =req.query.id;
    const returned = "Returned"
    const reason = req.body.reason;
    const orda = await Order.findById(orderId)
    await Order.findByIdAndUpdate(orderId, { status: returned,reason:reason });
    const order_data = await Order.find({user:orda.user}).populate("items.product").populate("items.stock")
    res.render('user-order',{order_data ,user} );
  }catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

}

module.exports = {
  payment,
  createOrder,
  placeOrder,
  IsOrderComplete,
  wallet,
  confirmRazorpay,
  ordercancel,
  orderStatus,
  orderUpdate,
  orderdetail,
  user_order,
  user_orderdetailspage,
  orderReturn
}
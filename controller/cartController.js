const Cart = require("../models/cartModels");
const Product = require("../models/productModel");
const User = require("../models/userModels");
const Coupon = require("../models/couponModel")
// const Address = require('../models/addressModel')

// User cart page loade
const userCart = async (req, res) => {
  
  const user = req.session.user;

  if (user) {
    try {
      const userId = user._id;

      const cart = await Cart.findOne({ userId: userId }).populate(
        "products.productId",
      );

      if (cart) {
        const productCount = cart.products.length;
        const cartId = cart._id;

        if (productCount > 0) {
          const products = cart.products;

          // Calculate delivery fee and GST
          const gstPercentage = 0.1; // Example GST percentage

          let totalPrices = 0;
          products.forEach((product) => {
            totalPrices += product.productId.price * product.stock;
          });
          
          let coupons = await Coupon.find()
         
          let deliveryFee = 40;
          const subtotal = totalPrices;
          const gstAmount = subtotal * gstPercentage;
          let totalPrice = subtotal + gstAmount + deliveryFee;

          const deliveryThresholdFree = 2000; // Subtotal threshold for free delivery
          const deliveryThresholdCharge = 200; // Subtotal threshold for changed delivery fee

          if (subtotal >= deliveryThresholdFree) {
            deliveryFee = "FREE Delivery"; // Free delivery
          } else if (subtotal <= deliveryThresholdCharge) {
            deliveryFee = 40; // Apply the changed delivery fee
          }

          totalPrice += deliveryFee;

          res.render("cartt", {
            user,
            products,
            productCount,
            cartId,
            deliveryFee,
            gstAmount,
            totalPrice,
            coupons,
            cart
          });
        } else {
          res.render("cartt", { user });
        }
      } else {
        res.render("cartt", { user });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Some Error occurred");
    }
  } else {
    res.render("home", { msg: "You need to log in first" });
  }
};

// User product add to cart
const add_to_cart = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    const productId = req.params.id;
    const product_data = await Product.findById(productId);
    if (product_data.stock < 1) {
      return res.json({
        status: "error",
        message: "Out of stock",
      });
    } else {
      let userCart = await Cart.findOne({ userId: userId });

      if (!userCart) {
        // If the user's cart doesn't exist, create a new cart
        const newCart = new Cart({ userId: userId, products: [] });
        await newCart.save();
        userCart = newCart;
      }

      const productIndex = userCart.products.findIndex(
        (product) => product.productId == productId,
      );

      if (productIndex === -1) {
        // If the product is not in the cart, add it
        userCart.products.push({ productId, stock: 1 });
      } else {
        if (product_data.stock <= userCart.products[productIndex].stock) {
          return res.json({
            status: "error",
            message: "Out of stock",
          });
        } else {
          // If the product is already in the cart, increase its quantity by 1
          userCart.products[productIndex].stock += 1;
        }
      }

      await userCart.save();
      res.json({
        status: "success",
        message: "Added to cart",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// user product stock increment
const incrementStock = async (req, res) => {
  const { productId, cartId } = req.body;
  try {
    // Find the cart using the provided cartId and populate the product details
    let cart = await Cart.findOne({ _id: cartId }).populate(
      "products.productId",
    );
    if (!cart) {
      return res.json({ success: false, message: "Cart not found" });
    }

    // Find the index of the product in the cart based on the productId
    const cartIndex = cart.products.findIndex((item) =>
      item.productId._id.equals(productId),
    );

    // Check if the product is present in the cart
    if (cartIndex === -1) {
      return res.json({
        success: false,
        message: "Product not found in the cart",
      });
    }

    cart.products[cartIndex].stock += 1;
    await cart.save();

    const product = cart.products[cartIndex].productId;
    const total = cart.products[cartIndex].stock * product.price;
    const remain = product.stock - cart.products[cartIndex].stock;

    res.json({
      success: true,
      total,
      stock: cart.products[cartIndex].stock,
      mess: remain > 0 ? remain : "out of stock",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to update quantity" });
  }
};

// user product stock decrement
const decrementStock = async (req, res) => {
  const { productId, cartId } = req.body;
  try {
    let cart = await Cart.findOne({ _id: cartId }).populate(
      "products.productId",
    );
    if (!cart) {
      return res.json({ success: false, message: "Cart not found" });
    }

    const cartIndex = cart.products.findIndex((item) =>
      item.productId._id.equals(productId),
    );

    // Check if the product is present in the cart
    if (cartIndex === -1) {
      return res.json({
        success: false,
        message: "Product not found in the cart",
      });
    }

    // Decrement the product quantity only if it's greater than 0
    if (cart.products[cartIndex].stock > 1) {
      cart.products[cartIndex].stock -= 1;
    } else {
      return res.json({
        success: false,
        message: "Product is already out of stock",
      });
    }

    await cart.save();

    // Calculate the total price for the product and get the remaining quantity
    const product = cart.products[cartIndex].productId;
    const total = cart.products[cartIndex].stock * product.price;
    const remain = product.stock - cart.products[cartIndex].stock;

    res.json({
      success: true,
      total,
      stock: cart.products[cartIndex].stock,
      mess: remain > 0 ? remain : "out of stock",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to update quantity" });
  }
};

// user Delete cart product
const deleteCartItem = async (req, res) => {
  const productId = req.params.id; // Correctly get productId from URL parameter
  try {
    const userId = req.session.user?._id;
    const productDeleted = await Cart.findOneAndUpdate(
      { userId: userId }, // Correct field name is userId
      { $pull: { products: { productId: productId } } },
      { new: true },
    );

    if (productDeleted) {
      res.redirect("/cartt");
    } else {
      console.log("Product not deleted");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// user Checkout
const checkout = async (req, res) => {
  const user = req.session.user;
  try {
    const userId = req.session.user?._id;
    const data = await User.findOne({ _id: userId });
    const cart = await Cart.findOne({ userId: userId }).populate(
      "products.productId",
    );

    if (!cart) {
      return res.render("cart", { user });
    }
    

 
    const items = cart.products.map((item) => {
      const product = item.productId;
      const stock = item.stock;
      const orginalPrice = item.orginalPrice
      const price = product.price;
      const gstAmount = cart.gstAmount;
      const deliveryFee = cart.deliveryFee;
      const totalPrice = cart.totalPrice

      if (!price) {
        throw new Error("Product price is required");
      }
      if (!product) {
        throw new Error("Product is required");
      }

      return {
        product: product._id,
        stock: stock,
        orginalPrice: orginalPrice,
        price: price,
        gstAmount,
        deliveryFee,
        totalPrice 
      };
     
    });
    let totalPrice = 0;
    items.forEach((item) => {
      totalPrice += item.price * item.stock;
    });
    const upcart = await Cart.findOneAndUpdate(
      { userId: userId },
      {
        total: totalPrice,
      }
    );
    if (cart) {
      const products = cart.products;
      let currentDate = new Date();
      currentDate = currentDate.toISOString().substr(0, 10);

      res.render("checkoutt", {
        currentDate,
        upcart,
        products: cart.products,
        address: data.deliveryAddress,
        gstAmount: items.reduce((total, item) => total + item.gstAmount, 0), // Calculate the total GST amount
        deliveryFee: items.reduce((total, item) => total + item.deliveryFee, 0), // Calculate the total delivery fee
      });
      
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Some Error occurred");
  }
};


const applyCoupon = async (req, res) => {
  
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
   
    const userId = req.session.user._id;

    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (!cart) {
      return res.json({ status: false, message: "Cart is empty." });
    }
   let totalPrices = 0;
    
    cart.products.forEach((item) => {
      totalPrices += item.productId.price * item.stock ;
    });

    if (totalPrices< coupon.minPurchase) {
      return res.json({
        status: false,
        total,
        message: `Purchase for ₹${coupon.minPurchase} to apply this Coupon`,
      });
    }
    ;
    let couponAmount = (totalPrices * coupon.discount) / 100;
    if (couponAmount > coupon.maxDiscount) {
      couponAmount = coupon.maxDiscount;
    }
    const gstPercentage = 0.1; // Example GST percentage
    const gstAmount = totalPrices * gstPercentage;

    let deliveryFee = 40; // Default delivery fee
    const deliveryThresholdFree = 2000; // Subtotal threshold for free delivery
    const deliveryThresholdCharge = 200; // Subtotal threshold for changed delivery fee

    if (totalPrices >= deliveryThresholdFree) {
      deliveryFee = 0; // Free delivery
    } else if (totalPrices <= deliveryThresholdCharge) {
      deliveryFee = 40; // Apply the changed delivery fee
    }
    const totalPrice = totalPrices - couponAmount + gstAmount + deliveryFee;
    
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      {
        coupon: id,
        deliveryFee,
        gstAmount,
        couponAmount,
        totalPrice,
      },
      { new: true } // Return the updated cart
    );
    console.log(  updatedCart)
    res.json({ status: true, cart: updatedCart, coupon });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "An error occurred." });
  }
};

const removeCoupon = async(req, res) => {
  console.log("testinggg");
  try {
      const { id } = req.query
      await Cart.updateOne({ user: id }, {
          $unset: {
              coupon:1,
              couponAmount:1,
              subTotal: 1,
              totalPrice:1
          }
      }).then(() => {
          res.json(true)
      })
  } catch (error) {
      console.log(error);
  }
}

module.exports = {
  userCart,
  add_to_cart,
  incrementStock,
  decrementStock,
  deleteCartItem,
  checkout,
  applyCoupon,
  removeCoupon
};

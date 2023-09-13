const mongoose = require("mongoose");

const User = require("../models/userModels");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Quantity = require("../models/QuantityModel");
const Cart = require("../models/cartModels");
const Review = require("../models/reviewModel");
const Banner = require("../models/bannerModel")
const Order = require("../models/orderModel")

const bcrypt = require("bcrypt");
const twilio = require("twilio");
const accontSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN
const verifySid = process.env.VERIFY_SID
// const twilioNumber = (process.env.ACCOUNT_SID, process.env.tWILIONUMBER);
const client = twilio(accontSid,authToken);


const securePassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt with cost factor 10
    return await bcrypt.hash(password, salt); // Hash the password using the generated salt
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};




const loadRegister = async (req, res) => {
  try {
    res.render("registration");
  } catch (error) {
    console.log(error);
  }
};


// register validation

const insertUser = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile,
      // buildingName,
      // pinCode,
      // district,
      password,
      confirmPassword,
    } = req.body;

    if (password !== confirmPassword) {
      return res.render("registration", {
        message: "Password and confirm password do not match",
      });
    }

    if (
      !name ||
      !email ||
      !mobile ||
      // !buildingName ||
      // !pinCode ||
      // !district ||
      !password
    ) {
      return res.render("registration", { message: "All fields are required" });
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.render("registration", { message: "Email already exists" });
    }

    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res.render("registration", { message: "Mobile already exists" });
    }

    const hashedPassword = await securePassword(password);

    // const addressData = {
    //   buildingName,
    //   pinCode,
    //   district,
    // };
    const user = new User({
      name,
      email,
      mobile,
      // address: [addressData],
      password: hashedPassword,
      is_admin: 0,
    });
    
    
    if (!/^\d{10}$/.test(mobile)) {
      return res.render("registration", {
        message: "Mobile number must be 10 digits",
      });
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return res.render("registration", {
        message: "Name should only contain letters",
      });
    }
    // if (!/^.{6,}$/.test(user.password)) {
    //   return res.render("registration" ,{ message: "Password should only contain atleast 6 Character" });
    // }

    // if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(user.password)) {
    //   return res.render("registration", { message: "Password should contain letters and numbers." });
    // }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/.test(
        password,
      )
    ) 
    {
      return res.render("registration", {
        message:
          "Password should contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@ $ ! % ? &), and must be at least 8 characters long.",
      });
    }

   
    

  // Send OTP to the user via SMS
  const otp = Math.floor(100000 + Math.random() * 900000);
  
  req.session.otp = otp;
  // console.log(otp);
    const phoneNumbers = [mobile]; // Add other phone numbers here if needed
    for (const phoneNumber of phoneNumbers) {
      const verification = await client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${phoneNumber}`, channel: "sms" });
      console.log(`OTP sent to ${phoneNumber}: ${otp}`);
    }

    console.log(otp);
 

    req.session.user = {
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      // address: user.address,
      password: user.password,
      is_admin: user.is_admin,
    };

    
 
    res.redirect("/verifyOtp");
  } catch (error) {
    console.log(error);
    return res.render("registration", {
      message: "An error occurred. Please try again.",
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
   
    const mobile = req.session.user.mobile; // Assuming 'user' object contains 'mobile'
   
    const phoneNumbers = [mobile]; // Add other phone numbers here if needed
    //
    for (const phoneNumber of phoneNumbers) {
      const verification = await client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${phoneNumber}`, channel: "sms" });
 
      console.log(`OTP sent to ${phoneNumber}: ${otp}`);
    }

    // Store the OTP and user data in the session
    req.session.otp = otp;
    const userData = req.session.user;
    req.session.user = {
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      // address: userData.address,
      password: userData.password,
      is_admin: userData.is_admin,
    };

    res.redirect("/verifyOtp");
  } catch (error) {
    console.log(error.message);
    return res.render("register", { message: "All fields should be filled" });
  }
};

const startOtpTimer = (req, res, next) => {
  const otpExpiryTime = 1 * 60 * 1000; //Set OTP expiry time to 1 minutes (in milliseconds)
  // Set the OTP timer in the session
  if (!req.session.otpTimer) {
    req.session.otpTimer = otpExpiryTime;

    // Start the timer
    setTimeout(() => {
      req.session.otpTimer = undefined; // Clear the OTP timer after expiry
    }, otpExpiryTime);
  }
  next();
};

const loadVerifyOtp = async (req, res) => {
  try {
    res.render("verifyOtp");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const otp = req.body.otp;
    const mob = req.body.mobile;
    if (otp == req.session.otp) {
      // OTP is correct, proceed with login
      let response = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: `+91${mob}`, code: otp });
    response.valid = true;
    
      const userData = req.session.user;
      req.session.user_id = req.session.user_id;
      req.session.otp = undefined; // Clear OTP after successful verification
      const user = new User({
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        // address: userData.address,
        password: userData.password,
        is_admin: userData.is_admin,
      });

      await user.save();

      return res.redirect("/login");
      // return res.render('registration', { message: 'Register successful' });
    } else {
      // Incorrect OTP
      return res.render("verifyOtp", { message: "Incorrect OTP" });
    }
  } catch (error) {
    console.log(error.message);
    return res.render("verifyOtp", { message: "An error occurred" });
  }
};

// Login user
const loginLoad = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userData = await User.findOne({ email });

    if (!userData) {
      res.render("login", { message: "User not found." });
    }

    if (userData.is_blocked) {
      res.render("login", { message: "your account is blocked" });
    }

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        req.session.user = { name: userData.name };
        req.session.user_id = userData._id;
        req.session.user = userData;

        res.redirect("/home");
      } else {
        res.render("login", { message: " Incurrect Password " });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// forgot password

const loadForgotPassword = async (req, res) => {
  try {
    res.render("forgotNumberVerify");
  } catch (error) {
    console.log(error.message);
  }
};

const forgotverifyNumber = async (req, res) => {
  req.session.mobile = req.body.mobile;
  const user = await User.findOne({ mobile: req.session.mobile });
  req.session.user = user;

  if (!user) {
    res.render("forgotNumber", { message: "User Not Registered" });
  } else {
    let forgotOtp = generateOTP();
    req.session.forgotOtp = forgotOtp;
    console.log(forgotOtp);
    console.log(req.session.forgotOtp);

    res.redirect("/forgotOtpVerify");
  }
};

const loadOtpPage = async (req, res) => {
  try {
    res.render("forgotOtpVerify");
  } catch (error) {
    console.log(error.message);
  }
};

const forgotOtpverify = async (req, res) => {
  try {
    const otp = req.body.otp;

    console.log(otp);

    if (otp == req.session.forgotOtp) {
      res.redirect("/loadrewritePassword");
    } else {
      res.render("forgotOtpVerify", { message: "Incorrect OTP" });
    }
  } catch (error) {
    console.log(error.message);
    return res.render("forgotOtpVerify", { message: "An error occurred" });
  }
};

const forgotresendOtp = async (req, res) => {
  try {
    const otp = generateOTP();
    req.session.forgotOtp = otp;

    console.log(otp);

    res.redirect("/forgotOtpverify");
  } catch (error) {
    console.log(error.message);
    return res.render("register", { message: "All fields should be filled" });
  }
};

const OtpTimer = (req, res, next) => {
  const otpExpiryTime = 1 * 60 * 1000;
  if (!req.session.otpTimer) {
    req.session.otpTimer = otpExpiryTime;

    setTimeout(() => {
      req.session.otpTimer = undefined;
    }, otpExpiryTime);
  }
  next();
};

const loadrewritePassword = async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    console.log(error.message);
  }
};

const WritePassword = async (req, res) => {
  try {
    const user = req.session.user;
    const userId = user._id;
    const newPassword = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const passwordHash = await securePassword(newPassword);

    await User.findByIdAndUpdate(userId, { password: passwordHash });
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
    // Handle the error appropriately (e.g., show an error message to the user)
  }
};

const loadHome = async (req, res) => {
  try {
    const User = req.session.user;
    const banner = await Banner.find()
    res.render("home", { User , banner });
  } catch (error) {
    console.log(error.message);
  }
};

const loadShowProduct = async (req, res) => {
  
    try {
      const searchQuery = req.query.search || ''; // Get the search query from the URL parameter
      const products = await Product.find({
        $or: [
          { name: { $regex: `.*${searchQuery}.*`, $options: 'i' } }, // Case-insensitive name search
          { description: { $regex: `.*${searchQuery}.*`, $options: 'i' } }, // Case-insensitive description search
        ]
      });
  
      const categories = await Category.find();
      const User = req.session.user;
      res.render("showProduct", { products, User, categories, searchQuery });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  };
  
    

//filter

const pricerange = async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    const categories = await Category.find({});
    const users = req.session.user;
    const searchQuery = req.query.search || '';
    const min_price = req.body.min_price;
    const max_price = req.body.max_price;

    let products = [];

    // Apply the search query
    if (searchQuery) {
      products = await Product.find({
        $or: [
          { name: { $regex: `.*${searchQuery}.*`, $options: 'i' } },
          { description: { $regex: `.*${searchQuery}.*`, $options: 'i' } },
        ]
      });
    } else {
      // Fetch all products when no search query is provided
      products = await Product.find();
    }

    // Apply the price range filter if min_price and max_price are provided
    if (min_price !== undefined && max_price !== undefined) {
      products = products.filter(product =>
        product.price >= min_price && product.price <= max_price
      );
    }

    const procount = products.length;

    // Determine if products meet the selected criteria
    if (!procount) {
      // Pass an empty array if there are no products matching the criteria
      res.render("showProduct", {
        users,
        categories,
        products: [],
        currentPage: page,
        totalPages,
        msg: "No products match the selected criteria",
        searchQuery,
        min_price,
        max_price
      });
    } else {
      // Pass the products that meet the criteria to the template
      const paginatedProducts = products.slice(skip, skip + ITEMS_PER_PAGE);
      res.render("showProduct", {
        users,
        categories,
        products: paginatedProducts,
        currentPage: page,
        totalPages,
        searchQuery,
        min_price,
        max_price
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


const filterByCategory = async (req, res) => {
  try {
    const categoryId = req.query.id;
    const category = await Category.find({});
    const selectedCategory = category.find(
      (cat) => cat._id.toString() === categoryId
    );
    const totalProducts = await Product.countDocuments({
      category: categoryId,
      is_listed: true,
    });

    const product = await Product.find({
      category: categoryId,
      is_listed: true,
    });
    const user = req.session.user;

    res.render("showProduct", {
      user,
      products: product,
      categories: category,
      totalProducts,
      categoryName: selectedCategory ? selectedCategory.name : "All",
      searchQuery: '' // Include an empty searchQuery to prevent the error
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "internal server error" });
  }
};


const loadDetails = async (req, res) => {
  try {
    const productId = decodeURIComponent(req.query.id);
    const product = await Product.findOne({ _id: productId });
    const quantity = await getQuantity(productId); // Replace "id" with "productId"

    const proId = new mongoose.Types.ObjectId(product._id);
    const productReviewAggregate = await Review.aggregate([
      {
        $match: { product: proId },
      },
      {
        $unwind: "$review",
      },
      {
        $lookup: {
          from: "users",
          localField: "review.user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 0,
          rating: "$review.rating",
          reviewText: "$review.review",
          userName: "$user.name",
          timestamp: "$review.timestamp",
        },
      },
    ]);
    const activeMenuItem = "/productList";
    res.render("single-product", {
      product,
      quantity,
      activeMenuItem,
      review: productReviewAggregate,
    });
  } catch (error) {
    console.log(error);
  }
};

const getQuantity = (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let sizes = await Quantity.distinct("quantities.size", {
        product: productId,
      });

      resolve({ sizes });
    } catch (error) {
      reject(error);
    }
  });
};

const loadProfile = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    const user_id = req.session.user_id;

    const user = await User.findById(user_id);

    if (!user) {
      return res.redirect("/login");
    }

    res.render("profile", { user });
  } catch (error) {
    console.log(error.message);
  }
};

const updateName = async (req, res) => {
  try {
    const id = req.query.id;
    const user_id = req.session.user_id;

    const userData = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: { name: req.body.name } },
    );
    res.redirect("/profile");
  } catch (error) {
    console.log(error.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const user_id = req.session.user_id;

    const user = await User.findById(user_id);

    if (!user) {
      return res.redirect("/login");
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.render("profile", {
        user,
        errorMessage: "New passwords do not match",
      });
    }

    // Check if the current password matches the stored hashed password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res.render("profile", {
        user,
        errorMessage: "Current passwords do not match",
      });
    }

    // Hash the new password before saving
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.password = newPasswordHash;
    await user.save();
    return res.render("profile", {
      user,
      errorMessage: "New passwords do not match",
    });
  } catch (error) {
    console.log(error.message);
    return res.render("profile", {
      errorMessage: "New passwords do not match",
    });
  }
};

const invoice = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    const orderId = req.query.id;
    const order_data = await Order.find({ _id: orderId }).populate("items.product").populate("items.stock");
    const cart = await Cart.findOne({ userId: userId }).populate("products.productId");

    const items = [];

    if (cart) {
      items = cart.products.map((item) => {
        const gstAmount = cart.gstAmount;
        const deliveryFee = cart.deliveryFee;
        const totalPrice = cart.totalPrice;

        return {
          gstAmount,
          deliveryFee,
          totalPrice,
        };
      });
    }
    res.render('invoice', {
      order_data: order_data[0],
      gstAmount: items.reduce((total, item) => total + item.gstAmount, 0), // Calculate the total GST amount
      deliveryFee: items.reduce((total, item) => total + item.deliveryFee, 0), // Calculate the total delivery fee
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


const userLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  insertUser,
  loadVerifyOtp,
  startOtpTimer,
  resendOtp,
  verifyOTP,
  loadrewritePassword,
  WritePassword,
  verifyLogin,
  loginLoad,
  loadForgotPassword,
  forgotverifyNumber,
  loadOtpPage,
  forgotOtpverify,
  forgotresendOtp,
  OtpTimer,
  loadHome,
  loadShowProduct,
  getQuantity,
  loadDetails,
  updateName,
  changePassword,
  loadProfile,
  pricerange,
  filterByCategory,
  invoice,
  
  userLogout,
};

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

   
    


  // console.log(otp);
    const phoneNumbers = [mobile]; // Add other phone numbers here if needed
    for (const phoneNumber of phoneNumbers) {
      const verification = await client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${phoneNumber}`, channel: "sms" });
      // console.log(`OTP sent to ${phoneNumber}: ${otp}`);
    }

 
 

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
    
      const userData = req.session.user;
      console.log(userData,'kkk');
      if (!userData) {
        return res.status(400).json({ message: "Invalid or expired session" });
      }
  
      // Assuming you have already defined the `client` and `verifySid` somewhere
      const mobile = userData.mobile;
      const phoneNumbers = mobile; // Add other phone numbers here if needed
  
      for (const phoneNumber of phoneNumbers) {
        const verification = await client.verify.v2
          .services(verifySid)
          .verifications.create({ to: `+91${phoneNumber}`, channel: "sms" });
      }
  
      req.session.user = {
        username: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        password: userData.password,
        is_admin: userData.is_admin,
      };
    res.redirect("/verifyOtp");
  } catch (error) {
    console.log(error.message);
    return res.render("verifyOtp", { message: "incorrect " });
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
    const userData = req.session.user;
      const verification = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({
          to: `+91${userData.mobile}`,
          code: otp,
        });
  if (verification.status === "approved") {
      console.log("Verification successful!");

    req.session.user_id = req.session.user_id; // Clear OTP after successful verification
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
  const mobile = req.body.mobile; // Initialize 'mobile' here
  console.log(mobile,'mob');
  const user = await User.findOne({ mobile });
  
  if (user) {
    const phoneNumbers = [mobile]; // Add other phone numbers here if needed
    for (const phoneNumber of phoneNumbers) {
      const verification = await client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${phoneNumber}`, channel: "sms" });
      // console.log(`OTP sent to ${phoneNumber}: ${otp}`);
    }
    res.redirect("/forgotOtpVerify");
  } else {
    res.render("forgotOtpVerify", { message: "User Not Registered", mobile: req.body.mobile }); // Pass 'mobile' to the template
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
    const userData = req.session.user;
      const verification = await client.verify.v2
        .services(verifySid)
        .verificationChecks.create({
          to: `+91${userData.mobile}`,
          code: otp,
        });
  if (verification.status === "approved") {
      console.log("Verification successful!");

    req.session.user_id = req.session.user_id; // Clear OTP after successful verification
      const user = new User({
        name: userData.name,
        email: userData.email,
        mobile: userData.mobile,
        // address: userData.address,
        password: userData.password,
        is_admin: userData.is_admin,
      });

  

      return res.redirect("/loadrewritePassword");
      // return res.render('registration', { message: 'Register successful' });
    } else {
      // Incorrect OTP
      return res.render("forgotOtpVerify", { message: "Incorrect OTP" });
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

// const WritePassword = async (req, res) => {
//   try {
//     const user = req.session.user;
//     const userId = user._id;
//     const newPassword = req.body.password;
//     const confirmPassword = req.body.confirmPassword;

//     const passwordHash = await securePassword(newPassword);

//     await User.findByIdAndUpdate(userId, { password: passwordHash });
//     res.redirect("/login");
//   } catch (error) {
//     console.log(error.message);
//     // Handle the error appropriately (e.g., show an error message to the user)
//   }
// };
const WritePassword = async (req, res) => {
  try {
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.newconfirmPassword;

    if (!newPassword || !confirmPassword) {
      return res.render("forgotPassword", {
        message: "Both password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.render("forgotPassword", { message: "Passwords do not match" });
    }

    // Hash the new password before saving
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    const user_id = req.session.user._id; // Assuming 'user' is correctly set in the session
    const user = await User.findByIdAndUpdate(
      user_id,
      { password: newPasswordHash },
      { new: true }
    );

    if (!user) {
      return res.redirect("/login");
    }

    // Clear the OTP from the session
    req.session.forgotOtp = undefined;

    return res.render("login", {
      message: "Password changed successfully",
    });
  } catch (error) {
    console.log(error.message);
    return res.render("forgotPassword", { message: "An error occurred" });
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
const loadContact = async (req, res) => {
  try {
    
    res.render("contact");
  } catch (error) {
    console.log(error.message);
  }
};
const loadAbout = async (req, res) => {
  try {
    
    res.render("about");
  } catch (error) {
    console.log(error.message);
  }
};

const ITEMS_PER_PAGE = 10;

const loadShowProduct = async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const page = +req.query.page || 1;

    const totalProducts = await Product.countDocuments({
      is_listed: true,
      $or: [
        { name: { $regex: `.*${searchQuery}.*`, $options: 'i' } },
        { description: { $regex: `.*${searchQuery}.*`, $options: 'i' } },
      ],
    });

    const products = await Product.find({
      is_listed: true,
      $or: [
        { name: { $regex: `.*${searchQuery}.*`, $options: 'i' } },
        { description: { $regex: `.*${searchQuery}.*`, $options: 'i' } },
      ],
    })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    const categories = await Category.find({});
    const User = req.session.user;

    res.render("showProduct", {
      products,
      User,
      categories,
      searchQuery,
      totalProducts,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
      ITEMS_PER_PAGE,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

  
    

//filter

const pricerange = async (req, res) => {
  try {
    // Set the number of items per page
    const page = +req.query.page || 1;
    const searchQuery = req.query.search || '';
    const min_price = req.body.min_price;
    const max_price = req.body.max_price;

    // Define a filter object for MongoDB query
    const filter = {
      is_listed: true,
      $or: [
        { name: { $regex: `.*${searchQuery}.*`, $options: 'i' } },
        { description: { $regex: `.*${searchQuery}.*`, $options: 'i' } },
      ],
    };

    // Apply price range filter if both min_price and max_price are provided
    if (min_price !== undefined && max_price !== undefined) {
      filter.price = { $gte: min_price, $lte: max_price };
    }

    // Fetch the total count of products matching the filter
    const totalProducts = await Product.countDocuments(filter);

    // Use skip and limit to paginate the products
    const skip = (page - 1) * ITEMS_PER_PAGE;
    const products = await Product.find(filter)
      .skip(skip)
      .limit(ITEMS_PER_PAGE);

    const categories = await Category.find({});
    const users = req.session.user;

    res.render("showProduct", {
      users,
      categories,
      products,
      currentPage: page,
      searchQuery,
      min_price,
      max_price,
      totalProducts,
      ITEMS_PER_PAGE,
      hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};


const filterByCategory = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const categoryId = req.query.id;
    const category = await Category.find({});
    const selectedCategory = category.find(
      (cat) => cat._id.toString() === categoryId
    );
    const totalProducts = await Product.countDocuments({
      category: categoryId,
      is_listed: true,
    });

    // Define a filter object to filter products by category
    const filter = {
      category: categoryId,
      is_listed: true,
    };

    const user = req.session.user;
    const skip = (page - 1) * ITEMS_PER_PAGE;
    
    // Use the filter object in your Product.find() query
    const products = await Product.find(filter)
      .skip(skip)
      .limit(ITEMS_PER_PAGE);

      res.render("showProduct", {
        user,
        products: products, // Use the filtered products
        categories: category,
        totalProducts,
        categoryName: selectedCategory ? selectedCategory.name : "All",
        searchQuery: '',
        ITEMS_PER_PAGE,
        currentPage: page, // Ensure that currentPage is being passed
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPrevPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
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
  loadContact,
  loadAbout,
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

const express = require('express');
const nocache = require('nocache');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const user_route = express();

user_route.use(nocache());
user_route.set('view engine', 'ejs');
user_route.set('views', './views/user');

user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));

const userController = require('../controller/userController');
const productController = require('../controller/productController');
const quantityController = require('../controller/quantityController');
const cartController = require('../controller/cartController');
const addressController = require('../controller/addressController');
const orderController = require('../controller/orderController');
const reviewController = require('../controller/reviewController');
const wishlistController = require('../controller/whishlistController')
const config = require('../config/config');
const auth = require('../middileware/auth');

// Set up MongoDBStore for session storage
const store = new MongoDBStore({
  uri: 'mongodb://127.0.0.1:27017/perfume',
  collection: 'perfume',
});

store.on('error', function (error) {
  console.error('Error while setting up MongoDB session store:', error);
});

user_route.use(
  session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: false,
    store: store,
  }),
);

user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));

user_route.get('/register', userController.loadRegister);
user_route.post('/register', userController.insertUser);

user_route.get(
  '/verifyOtp',
  userController.startOtpTimer,
  userController.loadVerifyOtp,
);
user_route.post('/verifyOtp', userController.verifyOTP);

user_route.get('/resend', userController.resendOtp);

user_route.get('/forgot', userController.loadForgotPassword);
user_route.post('/forgotverifyNumber', userController.forgotverifyNumber);
user_route.get('/forgotOtpverify', userController.loadOtpPage);
user_route.post('/forgotOtpverify', userController.forgotOtpverify);
user_route.get('/loadrewritePassword', userController.loadrewritePassword);
user_route.get('/forgotresend', userController.forgotresendOtp);
user_route.post('/forgotPassword', userController.WritePassword);

user_route.get('/login', userController.loginLoad);
user_route.post('/login', userController.verifyLogin);

user_route.get('/', userController.loadHome);
user_route.get('/home', auth.isblock, userController.loadHome);

user_route.get('/showProduct', auth.isblock, userController.loadShowProduct);
user_route.get('/your-search-route',userController.loadShowProduct)
// user_route.get('/filter',userController.filter);
user_route.post('/pricerange', auth.isblock, userController.pricerange);
user_route.get( '/filter-by-category', auth.isblock,userController.filterByCategory,);
//produt Details

user_route.get('/single-product', auth.isblock, userController.loadDetails);
user_route.get( '/showProduct/get-quantity', auth.isblock,quantityController.getQuantity,);
user_route.get('/profile',auth.isLoggedIn,auth.isblock,userController.loadProfile,);
user_route.post('/changepassword',auth.isLoggedIn,auth.isblock,userController.changePassword,);
user_route.post('/edit-user',auth.isLoggedIn,auth.isblock,userController.updateName,);

user_route.get('/profile-address',auth.isLoggedIn,auth.isblock,addressController.profileAddress,);
user_route.post('/profile-add-address',auth.isLoggedIn,auth.isblock,addressController.ProfileAddAddress,);

user_route.post('/profile-edit-address',auth.isLoggedIn,auth.isblock,addressController.profileEditAddress,);
user_route.get('/profile-delete-address',addressController.profileDeleteAddress,);

user_route.get('/user-order',auth.isLoggedIn,auth.isblock,orderController.user_order,);
user_route.get('/user-orderDetails',auth.isLoggedIn,auth.isblock,orderController.user_orderdetailspage,);
user_route.post('/user-orderDetails/add-review' , reviewController.addReview )
user_route.get('/order-cancel', orderController.ordercancel);
user_route.post('/order_Return',orderController.orderReturn);
user_route.get('/wallet',orderController.wallet)
user_route.get('/invoice',userController.invoice)
// cart Route
user_route.get('/cartt/:id',auth.isLoggedIn,auth.isblock,cartController.add_to_cart,);
user_route.get('/cartt', cartController.userCart);

user_route.get('/wishlist/:id',auth.isLoggedIn,auth.isblock,wishlistController.add_to_wishlist);
user_route.get('/wishlist', wishlistController.userWishlist);

user_route.post('/viewcart',auth.isLoggedIn,auth.isblock,cartController.userCart,);
user_route.post('/incrementStock',auth.isLoggedIn,auth.isblock,cartController.incrementStock,);
user_route.post('/decrementStock',auth.isLoggedIn,auth.isblock,cartController.decrementStock,);
user_route.get('/deleteCartItem/:id',auth.isLoggedIn,auth.isblock,cartController.deleteCartItem,);
//
user_route.get('/checkoutt',auth.isLoggedIn,auth.isblock,cartController.checkout,);
user_route.post('/addAddress', auth.isLoggedIn, auth.isblock, addressController.addAddress,);
user_route.get('/delete_address',auth.isLoggedIn,auth.isblock,addressController.deleteAddress);


user_route.get('/cartt/apply-coupon/:id',cartController.applyCoupon)
user_route.post('addCoupon',cartController.applyCoupon)


user_route.get('/payment',auth.isLoggedIn,auth.isblock,orderController.payment,);

user_route.post('/placeOrder',auth.isLoggedIn,auth.isblock,orderController.placeOrder,);
user_route.post('/createOrder', auth.isLoggedIn, orderController.createOrder);
user_route.post('/isOrderComplete',auth.isLoggedIn,orderController.IsOrderComplete,);
user_route.get('/confirms', orderController.confirmRazorpay);
user_route.get('/logout', userController.userLogout);

module.exports = user_route;

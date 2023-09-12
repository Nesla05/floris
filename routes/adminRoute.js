const express = require('express');
const nocache = require('nocache');
const session = require('express-session');
const admin_route = express();
const { uploadImages, upload } = require('../middileware/imageUpload');

admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));
admin_route.use(nocache());
admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');

const config = require('../config/config');
const adminController = require('../controller/adminController');
const categoryController = require('../controller/categoryController');
const productController = require('../controller/productController');
const quantityController = require('../controller/quantityController');
const orderController = require('../controller/orderController');
const bannerController = require('../controller/bannerController');
const couponController = require('../controller/couponcontroller')
const adminAuth = require('../middileware/adminAuth');
const user_route = require('./userRoute');

admin_route.use(
  session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: false,
  }),
);

admin_route.get(
  '/adminLogin',
  adminAuth.isAdminLogout,
  adminController.adminLoginLoad,
);
admin_route.post('/adminLogin', adminController.verifyAdminLogin);

admin_route.get(
  '/dashboard',
  adminAuth.isAdminLogin,
  adminController.adminDashboardLoad,
);

admin_route.get('/salesReport', adminController.salesReport);
admin_route.post('/filterSalesReport', adminController.filterSalesReport);

admin_route.get('/banner',bannerController.bannePage)
admin_route.post('/addBanner',uploadImages,bannerController.createBanner);
// admin_route.get('/addCategory', categoryController.showCategory);

admin_route.get('/coupon',couponController.displayCoupon)
admin_route.post('/addCoupon',couponController.addCoupon)
admin_route.get('/edit-coupon',couponController.displayEditCoupon)
admin_route.post('/edit-coupon',couponController.editCoupon)
admin_route.get('/delete-coupon/:id', couponController.deleteCoupon)

admin_route.get('/loadUser', adminAuth.isAdminLogin, adminController.loadUser);

admin_route.get('/blockUser', adminController.blockUser);
admin_route.get('/unblockUser', adminController.unBlockUser);

admin_route.get('/loadCategory', categoryController.loadCategory);
admin_route.post('/addCategory', categoryController.createCategory);
admin_route.get('/addCategory', categoryController.showCategory);

admin_route.get('/editCategory', categoryController.loadUpdateCategory);
admin_route.post('/editCategory', categoryController.updateCategory);
admin_route.get('/changeStatus', categoryController.changeStatus);

admin_route.get('/loadProductList', productController.loadProductList);
admin_route.get('/addProduct', productController.loadAddProduct);
admin_route.post('/addProduct', uploadImages, productController.createProduct);
admin_route.get('/productList', productController.showProduct);

admin_route.get('/editProduct', productController.loadEditProduct);
admin_route.post('/editProduct', productController.editProductList);
admin_route.post(
  '/product-add-image',
  upload.single('image'),
  productController.productAddImage,
);
admin_route.delete(
  '/delete-product-image',
  productController.deleteProductImage,
);
admin_route.post(
  '/edit-product-image',
  upload.single('image'),
  productController.editProductImage,
);

// admin_route.get('/deleteProduct',productController.deleteProduct);
admin_route.get('/productChangeStatus', productController.productChangeStatus);

admin_route.get('/addQuantity', quantityController.loadQuantity);
admin_route.post('/addQuantity', quantityController.addQuantity);
admin_route.get('/quantity', quantityController.displayProductQuantity);

admin_route.get('/orderDetail', orderController.orderdetail);
admin_route.get('/order', orderController.orderStatus);
admin_route.post('/orderUpdate', orderController.orderUpdate);
admin_route.post("/order_refund",adminController.refund);

admin_route.get(
  '/adminLogout',
  adminAuth.isAdminLogin,
  adminController.adminLogout,
);

module.exports = admin_route;

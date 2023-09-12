const Wishlist = require ('../models/whishlistModel')
const User = require('../models/userModels')
const Product = require('../models/productModel')
const mongoose = require('mongoose')

const userWishlist = async (req, res) => {
        try {
            const isUserLoggedIn = req.session.isUserLoggedIn || false;
            const userName = isUserLoggedIn ? req.session.userName : "";
            const activeMenuItem = "/shop";
          
            const userId = req.session.user._id;
            
            // Perform the database query to get wishlist products directly in the route handler
            const userObjId = new mongoose.Types.ObjectId(userId);
            const wishlistItems = await Wishlist.aggregate([
                {
                    $match: { user: userObjId }
                },
                {
                    $unwind: '$products'
                }, 
                {
                    $project: {
                        item: '$products.item',
                    }
                }, 
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                }, 
                {
                    $project: {
                        item: 1, 
                        product: { $arrayElemAt:['$productDetails',0]}
                    }
                }
            ]);
            
            res.render('wishlist', {
                isUserLoggedIn, 
                userName, 
                activeMenuItem, 
                products: wishlistItems, 
                layout: "layouts/profileLayout",
                activeMenuItem: "/wishlist"
            });
        } catch (error) {
            console.log(error);
        }
    
    
  };


  const add_to_wishlist = async (req, res) => {
    try {
      const userId = req.session.user?._id;
      const productId = req.params.id;
      console.log(productId, "Nesla Mandiiii");
  
      // Find the user's wishlist by userId
      let userWishlist = await Wishlist.findOne({ userId });
  
      if (!userWishlist) {
        // If the user's wishlist doesn't exist, create a new wishlist
        const newWishlist = new Wishlist({ userId, products: [] });
        userWishlist = await newWishlist.save();
      }
  
      // Check if the product is already in the wishlist
      const productIndex = userWishlist.products.findIndex(
        (product) => product.productId == productId
      );
   
      if (productIndex === -1) {
        // If the product is not in the wishlist, add it
        userWishlist.products.push({ productId, stock: 1 });
        await userWishlist.save();
        res.json({
          status: "success",
          message: "Added to wishlist",
        });
      } 
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

  module.exports ={
    userWishlist,
    add_to_wishlist
  }
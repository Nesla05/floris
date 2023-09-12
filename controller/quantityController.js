const Product = require("../models/productModel");
const Quantity = require("../models/QuantityModel");
const Category = require("../models/categoryModel");

//Admin side load Quantity page
const loadQuantity = async (req, res) => {
  try {
    const product = await Product.find({});
    const activeMenuItem = "addQuantity";
    res.render("addQuantity", {
      title: "Add Quantity",
      product: product || [], // Use an empty array if 'product' is falsy
      activeMenuItem,
    });
  } catch (error) {
    console.log(error);
  }
};

// Adminside Add quantity
const addQuantity = async (req, res) => {
  try {
    const { product, size, productPrice, stock } = req.body;
    const quantityObj = {
      product,
      size,
      productPrice,
      stock,
    };

    const isProduct = await Quantity.findOne({ product });

    if (isProduct) {
      const quantityExist = isProduct.quantities.findIndex(
        (q) => q.size === size,
      );
      console.log(quantityExist, "quantityExist");
      if (quantityExist === -1) {
        await Quantity.updateOne(
          { product },
          { $push: { quantities: quantityObj } },
        );
        res.redirect("/quantity");
      } else {
        res.render("addquantity", {
          message: "This combination already exists",
        });
      }
    } else {
      // If the product does not exist, create a new product with the quantity
      const newQuantity = new Quantity({
        product,
        quantities: [quantityObj],
      });

      await newQuantity.save();
      await Product.updateOne({ _id: product }, { $inc: { stock: stock } });

      res.redirect("/quantity");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

// adminside Dispaly Quantiy
const displayProductQuantity = async (req, res) => {
  try {
    const product = await Quantity.find({}).populate("product").exec();
    const category = await Category.find();
    const categoryMap = new Map();
    category.forEach((category) => {
      categoryMap.set(category._id.toString(), category.name);
    });
    const getCategoryName = (categoryId) => {
      return categoryMap.get(categoryId.toString());
    };
    const activeMenuItem = "/productQuantity";
    res.render("quantity", {
      title: "Product with Quantity",
      product,
      getCategoryName, // Pass the getCategoryName function as a local variable
      layout: "layouts/adminLayout",
      activeMenuItem,
    });
  } catch (error) {
    console.log(error);
  }
};

// user Side Disply Quantity
const getQuantity = async (req, res) => {
  try {
    const { productId, selectedSize } = req.query;

    const quantityDB = await Quantity.findOne(
      { product: productId },
      { quantities: 1 },
    );
    let quantitie = quantityDB.quantities.filter(
      (quantityElement) => quantityElement.size == selectedSize,
    );
    res.json(quantitie[0]);
  } catch (error) {
    console.log(error);
  }
};

//

module.exports = {
  loadQuantity,
  addQuantity,
  displayProductQuantity,
  getQuantity,
  // editQuantity,
  // dispalyEditedtData
};

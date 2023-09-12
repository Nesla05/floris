const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const { upload } = require("../middileware/imageUpload");

const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

const loadProductList = async (req, res) => {
  try {
    let categories = await Category.find({});

    const product = await Product.find({});
    const categoryMap = new Map();
    categories.forEach((category) => {
      categoryMap.set(category._id.toString(), category.name);
    });

    const getCategoryName = (categoryId) => {
      return categoryMap.get(categoryId.toString());
    };
    res.render("productList", {
      product: product,
      category: categories,
      getCategoryName,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadAddProduct = async (req, res) => {
  try {
    let categories = await Category.find({});

    res.render("addProduct", { category: categories });
  } catch (error) {
    console.log(error.message);
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, type, category, brand, stock, price , orginalPrice} = req.body;

    // Check if any of the required fields are missing
    if (!name || !description || !type || !category || !brand || !stock || !price || !orginalPrice) {
      return res.render('addProduct', { message: "All fields are required" });
    }
// console.log(category ,'ggggggggggg');
    // Check if any field contains spaces
    if (
      name.includes(" ") ||
      description.includes(" ") ||
      type.includes(" ") ||
      category.includes(" ") ||
      brand.includes(" ")
    ) {
      return res.render('addProduct', { message: "Fields cannot contain spaces." });
    }

    // Continue with product creation
    const filesArray = req.files ? Object.values(req.files).flat() : [];
    const images = filesArray.map((file) => file.filename);

    // Create and save the new product
    const newProduct = new Product({
      name,
      description,
      type,
      images,
      category,
      brand,
      stock,
      price,
      orginalPrice
    });

    await newProduct.save();
    return res.redirect('/productList'); // Redirect after successful creation
  } catch (err) {
    console.error("Error adding product:", err);
    return res.status(500).send("Error adding product to the database");
  }
};


const showProduct = async (req, res) => {
  try {
    res.redirect("/loadProductList");
  } catch (error) {
    console.log(error.message);
  }
};

const loadEditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const productData = await Product.find({ _id: id });
    // console.log(productData,'........................');
    const category = productData[0].category;
    const productCategory = await Category.find({ _id: category });
    const allCategory = await Category.find();

    res.render("editProduct", {
      productData,
      productCategory,
      allCategory,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteProductImage = async (req, res) => {
  try {
    const { productId, imgIndex } = req.body;
    const product = await Product.findById(productId);
    product.images.splice(imgIndex, 1);
    // Save the updated product
    await product.save();
    res.json(true);
  } catch (error) {
    console.log(error);
  }
};

const editProductImage = async (req, res) => {
  try {
    const { productId, index } = req.body;
    if (!req.file) {
      res.redirect(`/editProduct?id=${productId}`);
      return;
    }

    const croppedImagePath = `./public/sampleUploads/${req.file.filename}`;

    // Perform image cropping using Sharp and save the result to a file
    await sharp(req.file.path)
      .resize(960, 1200, { fit: "contain", background: "white" })
      .toFile(croppedImagePath);

    const product = await Product.findById(productId);

    if (product) {
      // Get the existing image filename at the specified index
      const existingFilename = product.images[index];

      product.images[index] = req.file.filename;
      console.log(product.images);

      // Save the updated product
      await product.save();

      res.json(true);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

const addProductImage = (req, res) => {
  try {
    uploadImg.single("image")(req, res, async (error) => {
      if (error instanceof multer.MulterError) {
        res.redirect("/editProduct");
        return;
      }

      if (!req.file) {
        res.redirect("/editProduct");
        return;
      }

      // Perform image cropping using Sharp and save the result to a file
      await sharp(req.file.path)
        .resize(960, 1200, { fit: "contain", background: "white" }) // Apply fit contain and white background color
        .toFile(croppedImagePath);

      deleteAllFilesInDir("./public/admin/uploads");

      const { proId } = req.body;

      await Product.updateOne(
        { _id: proId },
        {
          $push: { images: { filename: req.file.filename } },
        },
      );
      res.redirect(`/editProduct/${proId}`);
    });
  } catch (error) {
    console.log(error);
  }
};

const productAddImage = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!req.file) {
      res.redirect(`/editProduct?id=${productId}`);
      return;
    }

    const croppedImagePath = `./public/sampleUploads/${req.file.filename}`;

    // Perform image cropping using Sharp and save the result to a file
    await sharp(req.file.path)
      .resize(960, 1200, { fit: "contain", background: "white" })
      .toFile(croppedImagePath);

    const product = await Product.findById(productId);
    console.log(product);

    if (product) {
      // Update the images array with the new filename
      product.images.push(req.file.filename);

      // Save the updated product
      await product.save();

      res.redirect(`/editProduct?id=${productId}`);
    }
  } catch (error) {
    console.log(error);
  }
};
const editProductList = async (req, res) => {
  try {
    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;
    const type = req.body.type;
    const orginalPrice = req.body. orginalPrice;
    const price = req.body.price;
    const category = req.body.category;
    const stock = req.body.stock;
    const brand = req.body.brand;

    // Find the existing product data
    const productData = await Product.findById(id);

    await Product.updateOne(
      { _id: id },
      {
        $set: {
          name: name,
          description: description,
          type: type,
          price: price,
          orginalPrice:  orginalPrice,
          category: category,
          stock: stock,
          brand: brand,
        },
      },
    );

    res.redirect("productList");
  } catch (error) {
    console.log(error.message);
  }
};

const productChangeStatus = async (req, res) => {
  try {
    const product_id = req.query.id;
    const product = await Product.findById(product_id);

    if (product) {
      const updatedList = !product.is_listed; // Toggle the is_listed status
      product.is_listed = updatedList; // Update the product's is_listed field

      await product.save(); // Save the updated product
    }

    res.redirect("/loadProductList");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadProductList,
  loadAddProduct,
  createProduct,
  showProduct,
  addProductImage,
  loadEditProduct,
  productAddImage,
  editProductList,
  // deleteProduct,
  deleteProductImage,
  editProductImage,
  productChangeStatus,
};

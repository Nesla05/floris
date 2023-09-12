const Category = require("../models/categoryModel");

// Admin CAtegory page
const loadCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("categoryList", { categories });
  } catch (error) {
    console.log(error.message);
  }
};

// Admin Create Category
const createCategory = async (req, res) => {
  try {
    const name = req.body.name;
    const description = req.body.description;

    if (!name) {
      const categories = await Category.find();
      return res.render("categoryList", {
        message: "Name field is required",
        categories,
      });
    }

    if (!description) {
      const categories = await Category.find();
      return res.render("categoryList", {
        message: "Description field is required",
        categories,
      });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingCategory) {
      const categories = await Category.find();
      return res.render("categoryList", {
        message: "Name already exists",
        categories,
      });
    } else {
      const category = new Category({
        name: req.body.name,
        description: req.body.description,
      });
      const savedCategory = await category.save();
      res.redirect("/loadCategory");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Admin Categry Add Dispaly
const showCategory = async (req, res) => {
  try {
    res.redirect("/loadCategory");
  } catch (error) {
    console.log(error.message);
  }
};

// Admin Category Update page loade
const loadUpdateCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const Categorydata = await Category.findById({ _id: id });

    res.render("editCategory", { category: Categorydata });
  } catch (error) {
    console.log(error.message);
  }
};

// Admin Category update
const updateCategory = async (req, res) => {
  try {
    const categoryId = req.body.id;
    const newName = req.body.category.trim();
    const newDescription = req.body.description.trim();
    const category = await Category.find();
    // Validation checks
    if (!newName || !newDescription) {
      return res.render("editCategory", {
        message: "Both name and description are required",
        category,
      });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${newName}$`, "i") },
    });
    if (existingCategory && existingCategory._id.toString() !== categoryId) {
      return res.render("editCategory", {
        message: "Category name already exists",
        category,
      });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      { _id: categoryId },
      { $set: { name: newName, description: newDescription } },
    );

    res.redirect("/loadCategory");
  } catch (error) {
    console.log(error.message);
    res.render("yourPage", { error: "Failed to update category" });
  }
};

// Admin Change status(list/unlist)
const changeStatus = async (req, res) => {
  try {
    const category_id = req.query.id;
    const category = await Category.findById(category_id);

    if (category) {
      const updatedList = !category.isListed;
      var result = await Category.updateOne(
        { _id: category.id },
        { $set: { isListed: updatedList } },
      );
      await category.save();
    }

    res.redirect("/loadCategory");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadCategory,
  createCategory,
  showCategory,
  loadUpdateCategory,
  updateCategory,
  changeStatus,
};

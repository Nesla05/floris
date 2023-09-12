const { model } = require("mongoose");
const User = require("../models/userModels");

const isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/");
  }
};

const isblock = async (req, res, next) => {
  if (req.session.user) {
    const userId = req.session.user?._id;
    const userblock = await User.findById(userId);
    if (userblock.is_blocked) {
      console.log("block");
      req.session.user = null;
      req.session.authorized = false;
      res.redirect("/");
    } else {
      next();
    }
  } else {
    next();
  }
};

module.exports = {
  isLoggedIn,
  isblock,
};

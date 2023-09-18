
const User = require("../models/userModels");

const isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/home");
  }
};

const loadHome = (req, res, next) => {
  if (req.session.user) {
    res.redirect("/home");
  } else {
    next();
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

const isLogout = async (req, res, next) => {
  try {
    if (!req.session.user) {
      res.redirect("/");
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  isLoggedIn,
  loadHome,
  isblock,
  isLogout
};

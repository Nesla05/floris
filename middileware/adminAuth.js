const isAdminLogin = async (req, res, next) => {
  try {
    if (req.session.admin_id) {
      next();
    } else {
      res.redirect("/adminLogin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const isAdminLogout = async (req, res, next) => {
  try {
    if (req.session.admin_id) {
      res.redirect("/userList");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  isAdminLogin,
  isAdminLogout,
};

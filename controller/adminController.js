const Admin = require("../models/adminModels");
const User = require("../models/userModels");
const Order = require("../models/orderModel");

//admin login page

const adminLoginLoad = async (req, res) => {
  try {
    res.render("adminlogin");
  } catch (error) {
    console.log(error.message);
  }
};

//Admin Login Verification
const verifyAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminData = await Admin.findOne({ email });

    if (adminData) {
      req.session.admin_id = adminData._id;
      res.redirect("/dashboard");
    } else {
      res.render("adminlogin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// Admin Dashbord
const adminDashboardLoad = async (req, res) => {
  try {
    const preDate = "";
    const postDate = "";
    const order_data = await Order.find()
      .populate("user")
      .populate("items.product")
      .populate("items.stock");

    const today = new Date().toISOString().split("T")[0];
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setDate(endOfDay.getDate() + 1);
    endOfDay.setMilliseconds(endOfDay.getMilliseconds() - 1);

    const orders = await Order.find(); // Fetching all orders from the database

    // Extracting necessary data for the chart
    const salesData = orders.map((order) => ({
      createdAt: order.createdAt.toISOString().split("T")[0], // Extracting date only
      total: order.total,
    }));

    // Calculating the total sales for each date
    const salesByDate = salesData.reduce((acc, curr) => {
      acc[curr.createdAt] = (acc[curr.createdAt] || 0) + curr.total;
      return acc;
    }, {});

    // Converting the sales data into separate arrays for chart labels and values
    const chartLabels = Object.keys(salesByDate);
    const chartData = Object.values(salesByDate);

    const todaySales = await Order.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });

    const totalsales = await Order.countDocuments({ status: "Delivered" });

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lt: endOfDay },
          payment_method: { $in: ["wallet", "paypal"] },
        },
      },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]);

    const revenue = todayRevenue.length > 0 ? todayRevenue[0].totalRevenue : 0;

    const TotalRevenue = await Order.aggregate([
      {
        $match: { status: "Delivered" },
      },
      { $group: { _id: null, Revenue: { $sum: "$total" } } },
    ]);

    const Revenue = TotalRevenue.length > 0 ? TotalRevenue[0].Revenue : 0;

    const Orderpending = await Order.countDocuments({ status: "Pending" });
    const OrderReturn = await Order.countDocuments({
      status: "Returned",
    });
    const Ordershipped = await Order.countDocuments({ status: "Shipped" });
    const OrderRefunted = await Order.countDocuments({ status: "Refunded" });

    const Ordercancelled = await Order.countDocuments({
      status: "cancelled",
    });

    const salesCountByMonth = await Order.aggregate([
      {
        $match: {
          status: "Delivered",
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          count: 1,
        },
      },
    ]);

    res.render("dashboard", {
      todaySales,
      totalsales,
      revenue,
      Revenue,
      Orderpending,
      Ordershipped,
      Ordercancelled,
      OrderRefunted,
      salesCountByMonth,
      OrderReturn,
      chartLabels: JSON.stringify(chartLabels),
      chartData: JSON.stringify(chartData),
      order_data,
      preDate,
      postDate,
    });
  } catch (err) {
    res.status(500).send(err.message); // Send error response with status code 500
  }
};

// Admin Sales Report
const salesReport = async (req, res) => {
  try {
    const preDate = "";
    const postDate = "";
    const order_data = await Order.find()
      .populate("user")
      .populate("items.product")
      .populate("items.stock");
    res.render("salesReport", { order_data, preDate, postDate });
  } catch (err) {
    res.status(500).send(err.message); // Send error response with status code 500
  }
};

// Admin sales Reprt Filtering
const filterSalesReport = async (req, res) => {
  try {
    const preDate = new Date(req.body.preDate);
    const postDate = new Date(req.body.postDate);

    const order_data = await Order.find({
      createdAt: { $gte: preDate, $lte: postDate },
    })
      .populate("user")
      .populate("items.product")
      .populate("items.stock");
    res.render("salesReport", {
      order_data,
      preDate: req.body.preDate,
      postDate: req.body.postDate,
    });
  } catch (error) {
    console.error(error);
    res.send(error);
  }
};

// Admin first page
const adminLoadHome = async (req, res) => {
  try {
    res.render("adminlogin");
  } catch (error) {
    console.log(error.message);
  }
};

// Admin User List
const loadUser = async (req, res) => {
  try {
    const search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const userData = await User.find({
      $or: [
        { name: { $regex: ".*" + search + ".*" } },
        { email: { $regex: ".*" + search + ".*" } },
        { mobile: { $regex: ".*" + search + ".*" } },
      ],
    });

    res.render("userList", { user: userData });
  } catch (error) {
    console.log(error.message);
  }
};

// Admin user Block
const blockUser = async (req, res) => {
  try {
    const id = req.query.id;
    await User.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: true } });
    res.redirect("/loadUser");
  } catch (error) {
    console.log(error.message);
  }
};

// Admin User Unblock
const unBlockUser = async (req, res) => {
  try {
    const id = req.query.id;
    await User.findByIdAndUpdate({ _id: id }, { $set: { is_blocked: false } });
    res.redirect("/loadUser");
  } catch (error) {
    console.log(error.message);
  }
};
const refund = async (req, res) => {
  try {
    const orderId = req.query.id;
    const newStatus = "Refunded"
    await Order.findByIdAndUpdate(orderId, { status: newStatus });
    const order = await Order.findById(orderId);
    const user = await User.findById(order.user);

    console.log(order.total);

    // Ensure user.wallet is initialized as an array
    if (!user.wallet) {
      user.wallet = [];
    }

    const wallets = user.totalWallet + order.total;
    user.wallet.push(order.total);
    user.totalWallet = wallets;
    await user.save();
    res.redirect('/order');
  } catch (error) {
    console.error(error);
    res.send(error);
  }
}

//Admin LogOut
const adminLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  adminLoginLoad,
  verifyAdminLogin,
  adminDashboardLoad,
  salesReport,
  filterSalesReport,
  adminLoadHome,
  loadUser,
  blockUser,
  unBlockUser,
  refund,
  adminLogout,
};

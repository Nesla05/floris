const User = require("../models/userModels");
const Cart = require("../models/cartModels");

//....................profile addrress section Start.....................

const profileAddress = async (req, res) => {
  try {
    const user_id = req.session.user_id;
    const user = await User.findById(user_id);
    // console.log("good", user);
    res.render("profile-address", { user });
  } catch (error) {
    console.log(error.message);
  }
};

//......profile Add addrress .......

const ProfileAddAddress = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    const newAddress = req.body;

    // Find the user by a specific identifier
    const user = await User.findOne({ _id: userId });
    if (!user) {
      res.status(404).send("User not found.");
      return;
    }

    // Validate the input fields
    const { name, mobile, email, houseName, district, state, pincode } = newAddress;
    if (!name || !mobile || !email || !houseName || !district || !state || !pincode) {
      res.status(400).send("All fields are required.");
      return;
    }

    // Validate mobile number format (must be exactly 10 digits)
    if (!/^\d{10}$/.test(mobile)) {
      res.status(400).send("Mobile number must be exactly 10 digits.");
      return;
    }

    

    user.deliveryAddress.push(addressObject);

    await user.save();
    res.redirect(`/profile-address`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};


// ............profile edit address.........

const profileEditAddress = async (req, res) => {
  try {
    const addressId = req.query.id;

    const userId = req.session.user?._id;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).send("User not found.");
    }

    const addressIndex = user.deliveryAddress.findIndex(
      (address) => address._id.toString() === addressId,
    );
    if (addressIndex === -1) {
      return res.status(404).send("Address not found.");
    }

    // Update the address fields based on the provided form data
    user.deliveryAddress[addressIndex].name = req.body.name;
    user.deliveryAddress[addressIndex].mobile = req.body.mobile;
    user.deliveryAddress[addressIndex].email = req.body.email;
    user.deliveryAddress[addressIndex].address = req.body.houseName;
    user.deliveryAddress[addressIndex].district = req.body.district;
    user.deliveryAddress[addressIndex].state = req.body.state;
    user.deliveryAddress[addressIndex].pincode = req.body.pincode;

    // Save the updated user document
    await user.save();

    // Redirect the user to the address list page after the address is updated
    res.redirect("/profile-address");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error.");
  }
};

// ............profile delete addres...........

const profileDeleteAddress = async (req, res) => {
  try {
    const addId = req.query.id;

    const userId = req.session.user?._id;

    const foundUser = await User.findOne({ _id: userId });

    if (!foundUser) {
      return res.status(404).send("User not found");
    }

    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { deliveryAddress: { _id: addId } } },
      { new: true },
    );

    res.redirect("/profile-address");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};
//................Profile Address Section End..............

//******************** checkout Add Section Start ************************

// ....checkout Add address .......
const addAddress = async (req, res) => {
  try {
    const userId = req.session.user?._id;
    const newAddress = req.body;

    // Find the user by a specific identifier
    const user = await User.findOne({ _id: userId });
    if (!user) {
      res.status(404).send("User not found.");
      return;
    }

    // Validate input fields
    if (
      !newAddress.name ||
      !newAddress.mobile ||
      !newAddress.email ||
      !newAddress.houseName ||
      !newAddress.district ||
      !newAddress.state ||
      !newAddress.pincode
    ) {
      res.status(400).send("All fields are required.");
      return;
    }

   

    if (!/^\d{10}$/.test(newAddress.mobile)) {
      res.status(400).send("Mobile number must be 10 digits.");
      return;
    }

    if (!/^[\w\.-]+@[\w\.-]+\.\w+$/.test(newAddress.email)) {
      res.status(400).send("Invalid email format.");
      return;
    }

    // Create a new address object
    const addressObject = {
      name: newAddress.name,
      mobile: newAddress.mobile,
      email: newAddress.email,
      houseName: newAddress.houseName,
      district: newAddress.district,
      state: newAddress.state,
      pincode: newAddress.pincode,
    };

    // Push the new address data to the existing address array
    user.deliveryAddress.push(addressObject);

    // Save the updated user document
    await user.save();

    res.redirect(`/checkoutt`);
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred.");
  }
};

//..............checkout Delete address ............

const deleteAddress = async (req, res) => {
  try {
    const addId = req.query.id;

    const userId = req.session.user?._id;

    const foundUser = await User.findOne({ _id: userId });

    if (!foundUser) {
      return res.status(404).send("User not found");
    }

    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { deliveryAddress: { _id: addId } } },
      { new: true },
    );

    res.redirect("/checkoutt");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

//******************** checkout address section end ********************

module.exports = {
  profileAddress,
  ProfileAddAddress,
  profileEditAddress,
  profileDeleteAddress,
  addAddress,
  deleteAddress,
};

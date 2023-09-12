const Coupon = require ('../models/couponModel.js')
const Category = require('../models/categoryModel')

const displayCoupon = async(req, res) => {
    try {
        const coupons = await Coupon.find().exec();
        
        
    
        res.render("coupon", {
          coupons
          
        });
      } catch (error) {
        console.error(error);
        res.send({ message: error.message });
      }
}


const addCoupon = async (req , res) =>{
   console.log('testinggg');
   try {
    const { name, minPurchase, discount, maxDiscount, expiry } = req.body
    const isCoupon = await Coupon.findOne({ name })
    if (isCoupon) {
        // req.flash("errorMsg", "Coupon Name already exists!!!")
        res.redirect('/coupon')
    } else {
        const newCoupon = new Coupon({
            name,
            minPurchase,
            discount,
            expiry,
            maxDiscount
        })
        newCoupon.save().then(() => {
            // req.flash("successMsg", `${name} added Successfully...`)
            res.redirect('/coupon')
        })
    }
} catch (error) {
    console.log(error);
}

}
const displayEditCoupon = async (req, res) => {
    try {
        const id= req.query.id;
        const coupon = await Coupon.findById(id)
        res.json(coupon)
    } catch (error) {
        console.log(error);
    }
}

const editCoupon = async (req, res) => {
    try {
        const { id, name, minPurchase, discount, maxDiscount, expiry } = req.body;
        const isActive = req.body.isActive ? true : false;
        const coupon = await Coupon.findById(id);

        if (coupon.name !== name) {
            const isCoupon = await Coupon.findOne({ name });
            if (isCoupon) {
                // req.flash("errorMsg", "Coupon Name already exists!!!");
                res.redirect('/coupon');
                return;
            }
        }

        await Coupon.updateOne({ _id: id }, {
            name,
            minPurchase,
            discount,
            maxDiscount,
            expiry,
            isActive
        }).then(() => {
            // req.flash("successMsg", `${name} edited Successfully...`);
            res.redirect('/coupon');
        });
    } catch (error) {
        console.log(error);
    }
};


//Deleting a Coupon 
const deleteCoupon = async(req, res) => {
    try {
        const { id } = req.params
        await Coupon.findByIdAndRemove(id).then(() => {
            // req.flash("successMsg", "Coupon deleted Successfully")
            res.redirect('/coupon')
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    displayCoupon,
    addCoupon,
    displayEditCoupon,
    editCoupon,
    deleteCoupon 
}
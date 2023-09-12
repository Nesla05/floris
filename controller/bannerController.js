const Banner = require("../models/bannerModel");
const  { upload }  = require("../middileware/imageUpload");
const multer = require("multer");
const sharp = require("sharp");

const bannePage = async (req , res) =>{
  try{
    const banner = await Banner.find()
    res.render('banner',{banner})
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating a create operation",
    });
  }

}

const createBanner = async (req, res) => {
  try {
    console.log("-------------");
    console.log(req.body);
    console.log("-------------");
    const {  bannerName ,description } = req.body;

  


    // Continue with product creation
    const filesArray = req.files ? Object.values(req.files).flat() : [];
    const images = filesArray.map((file) => file.filename);

    // Create and save the new product
    const newBanner = new Banner({
      bannerName ,description ,images
    });

    await newBanner.save();
    return res.redirect('/banner'); // Redirect after successful creation
  } catch (err) {
    console.error("Error adding product:", err);
    return res.status(500).send("Error adding product to the database");
  }
};


module.exports ={
  bannePage,
  createBanner,
}
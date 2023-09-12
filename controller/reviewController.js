const Review = require("../models/reviewModel");
const Order = require("../models/orderModel");

const addReview = async (req, res) => {
  try {
    console.log("------------");
    console.log(req.body);
    console.log("------------");
    const userId = req.session.user._id;
    const { productId, orderId, rating, review } = req.body;
    console.log(req.body. rating,'hii');
    const reviewObj = [
      {
        user: userId,
        orderId,
        rating,
        review,
      },
    ];
    console.log(productId)
    const productid = parseInt(productId.toString())
    // console.log(productid,'hrllo');
    const isReview = await Review.findOne({ product: productId });
    if (isReview) {
      await Review.findOneAndUpdate(
        { product: productId },
        {
          $push: { review: reviewObj },
        },
      ).then(async () => {
        await addReviewToOrder(orderId, productId, rating, review);
        res.json({ status: true, message: "Review Added Successfully" });
      });
    } else {
      const newReview = new Review({
        product: productId,
        review: reviewObj,
      });
      // newReview.save().then(async () => {
      //   await addReviewToOrder(orderId, productId, rating, review);
      //   res.json({ status: true, message: "Review Added Successfully" });
      // });
    }
  } catch (error) {
    console.log(error);
  }
};
const fetchReview = async (req, res) => {
  try {
      const {orderId, productId} = req.params
      const review = await Review.findOne(
          {
            product: productId,
            review: {
              $elemMatch: { orderId: orderId }
            }
          },
          { 'review.$': 1 }
        );
        
      res.json(review)
  } catch (error) {
      console.log(error);
  }
}
module.exports = {
  addReview,
  fetchReview,
};

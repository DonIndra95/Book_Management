const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const { isValidObjectId } = require("mongoose");
const validators = require("../validator/validations");

const createReview = async (req, res) => {
  try {
    if (!validators.isValidRequest(req.body))
      return res.status(400).send({ status: false, message: "Bad Request" });

    let review = {};
    review.reviewedAt = Date.now();
    if (!req.params.bookId || !isValidObjectId(req.params.bookId))
      return res.status(400).send({ status: false, message: "Invalid BookId" });
    if (
      !req.body.rating ||
      !(Number(req.body.rating) >= 1 && Number(req.body.rating) <= 5)
    )
      return res.status(400).send({ status: false, message: "Invalid Rating" });

    if (req.body.reviewedBy) {
      req.body.reviewedBy = req.body.reviewedBy
        .split(" ")
        .filter((e) => e)
        .join(" ");
      if (validators.isValidName(req.body.reviewedBy))
        review.reviewedBy = req.body.reviewedBy;
      else
        return res
          .status(400)
          .send({ status: false, message: "Invalid reviewer Name" });
    }
    if (req.body.review) {
      if (validators.isValid(req.body.review))
        review.review = req.body.review
          .split(" ")
          .filter((e) => e)
          .join(" ");
      else
        return res
          .status(400)
          .send({ status: false, message: "Invalid review" });
    }

    if (
      !(await bookModel.findOne({ _id: req.params.bookId, isDeleted: false }))
    )
      return res
        .status(404)
        .send({ status: false, message: "BookId Not Exist" });

    review.bookId = req.params.bookId;
    review.rating = Math.round(req.body.rating);

    let data = await reviewModel.updateOne(
      { rating: review.rating, reviewedBy: review.reviewedBy,isDeleted:false },
      review,
      { upsert: true, new: true }
    );
    let book = await bookModel.findOne(
      { _id: review.bookId },
      { __v: 0, ISBN: 0 }
    );
    if (data.matchedCount === 0)
      book = await bookModel.findOneAndUpdate(
        { _id: review.bookId },
        { $inc: { reviews: 1 } },
        { new: true }
      );
    book._doc.reviewsData = await reviewModel.find(
      { bookId: book._id,isDeleted:false},
      { __v: 0 }
    );
    res.status(201).send({ status: true, message: "Books List", data: book });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const reviewDeleteById = async (req, res) => {
   try{
    if (!req.params.bookId || !isValidObjectId(req.params.bookId))
    return res.status(400).send({ status: false, message: "Invalid BookId" });
  if (!req.params.reviewId || !isValidObjectId(req.params.reviewId))
    return res.status(400).send({ status: false, message: "Invalid ReviewId" });

  if (!(await bookModel.findOne({ _id: req.params.bookId, isDeleted: false })))
    return res.status(404).send({ status: false, message: "BookId Not Exist" });
    
  let data = await reviewModel.updateOne(
    { _id: req.params.reviewId, bookId: req.params.bookId, isDeleted: false },
    { isDeleted: true }
  );
  if (data.matchedCount === 0)
  return res
  .status(404)
  .send({ status: false, message: "Review Not Exist" });

  book = await bookModel.findOneAndUpdate(
    { _id: req.params.bookId },
    { $inc: { reviews: -1 } },
    { new: true }
  );

  return res
  .status(200)
  .send({ status: true, message: "Review is deleted" });
   

   } catch(err){

    return res.status(500).send({ status: false, message: err.message });

   }
}

const updateReview=async (req, res) => {
  try{

    if (validators.isValidRequest(req.query)||!validators.isValidRequest(req.body))
      return res.status(400).send({
        status: false,
        message: "Please enter valid input in body",
      });
      

      let {review,rating,reviewedBy}=req.body
      let body=Object.keys(req.body)
      if (body.length) {
        let output = body.filter((ele) =>["review", "rating", "reviewedBy"].includes(ele));
        if (!output.length)
          return res.status(400).send({
            status: false,
            message: "Please enter valid input in body",
          });
      }
      let updateReviews={}

      if (review) {
        if (validators.isValid(review))
          updateReviews.review = review
            .split(" ")
            .filter((e) => e)
            .join(" ");
        else
          return res
            .status(400)
            .send({ status: false, message: "Invalid review" });
      }
      if (rating ){
      if(!(Number(rating) >= 1 && Number(rating) <= 5))
        return res.status(400).send({ status: false, message: "Invalid Rating" });
        updateReviews.rating=rating
      }
  
      if (reviewedBy) {
        reviewedBy = reviewedBy
          .split(" ")
          .filter((e) => e)
          .join(" ");
        if (validators.isValidName(reviewedBy))
          updateReviews.reviewedBy = reviewedBy;
        else
          return res
            .status(400)
            .send({ status: false, message: "Invalid reviewer Name" });
      }

      let {bookId,reviewId}=req.params

      if(!isValidObjectId(bookId))return res
      .status(400)
      .send({ status: false, message: "Invalid BookId" });

      if(!isValidObjectId(reviewId))return res
      .status(400)
      .send({ status: false, message: "Invalid reviewId" });

      let updatedReview= await reviewModel.findOneAndUpdate({_id:reviewId,bookId:bookId,isDeleted:false},updateReviews,{new:true})

      if(!updatedReview)
      return res
      .status(404)
      .send({ status: false, message: "Review not found" });

      res.status(200).send({status: true, message: "Success",data:updatedReview})   


  }catch(err){
    return res.status(500).send({ status: false, message: err.message });

   }
}

module.exports={createReview,reviewDeleteById,updateReview};

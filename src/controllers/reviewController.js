const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const { isValidObjectId } = require("mongoose");
const {
  isValidRequest,
  isValidName,
  isValid,
} = require("../validator/validations");

//----------------------------------------create Review-----------------------------------------
const createReview = async (req, res) => {
  try {
    // validating the input request
    if (!isValidRequest(req.body))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid input" });

    let body = Object.keys(req.body);
    if (body.length) {
      let output = body.filter((ele) =>
        ["reviewedBy", "rating", "review"].includes(ele)
      );
      if (!output.length)
        return res.status(400).send({
          status: false,
          message: "Please enter valid input in body",
        });
    }

    let { reviewedBy, rating, review } = req.body;

    let reviews = {};

    reviews.reviewedAt = Date.now();
    if (!req.params.bookId || !isValidObjectId(req.params.bookId))
      return res.status(400).send({ status: false, message: "Invalid BookId" });

    // validating the rating
    if (!rating)
      return res.status(400).send({
        status: false,
        message: "Please provide valid rating between 1 to 5",
      });
    if (!(Number(rating) >= 1 && Number(rating) <= 5))
      return res.status(400).send({ status: false, message: "Invalid Rating" });

    // validating reviewer name
    if (reviewedBy?.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please enter reviewedBy" });

    if (reviewedBy) {
      if (typeof reviewedBy !== "string")
        return res.status(400).send({
          status: false,
          message: "Enter valid reviewer name in string",
        });

      reviewedBy = req.body.reviewedBy
        .split(" ")
        .filter((e) => e)
        .join(" ");

      if (isValidName(reviewedBy)) reviews.reviewedBy = reviewedBy;
      else
        return res
          .status(400)
          .send({ status: false, message: "Invalid reviewer Name" });
    }
    if (!reviewedBy) reviews.reviewedBy = "Guest";

    // validating review
    if (review?.length == 0)
      return res.status(400).send({ status: false, message: "Invalid review" });

    if (review) {
      if (isValid(review))
        reviews.review = req.body.review
          .split(" ")
          .filter((e) => e)
          .join(" ");
      else
        return res
          .status(400)
          .send({ status: false, message: "Invalid review" });
    }

    // valiating the bookId which is coming from params
    if (
      !(await bookModel.findOne({ _id: req.params.bookId, isDeleted: false }))
    )
      return res
        .status(404)
        .send({ status: false, message: "BookId Not Exist" });

    reviews.bookId = req.params.bookId;
    reviews.rating = Math.round(req.body.rating * 10) / 10;

    // creating review
    let data = await reviewModel.create(reviews);

    // updating number of reviews in books collection
    let book = await bookModel
      .findOneAndUpdate(
        { _id: reviews.bookId },
        { $inc: { reviews: 1 } },
        { new: true }
      )
      .select({ __v: 0, ISBN: 0 });

    // merging book and review data
    book._doc.reviewsData = data;
    res.status(201).send({ status: true, message: "Books List", data: book });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//-----------------------------------------Delete review------------------------------------------------
const reviewDeleteById = async (req, res) => {
  try {
    let { bookId, reviewId } = req.params;

    // validating  bookID
    if (!bookId || !isValidObjectId(bookId))
      return res.status(400).send({ status: false, message: "Invalid BookId" });

    // validating reviewID
    if (!reviewId || !isValidObjectId(reviewId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid ReviewId" });

    // checking for bookID in books collection
    if (!(await bookModel.findOne({ _id: bookId, isDeleted: false })))
      return res
        .status(404)
        .send({ status: false, message: "BookId Not Exist" });

    // updating isDeleted key in review model
    let data = await reviewModel.updateOne(
      { _id: reviewId, bookId: bookId, isDeleted: false },
      { isDeleted: true }
    );
    if (data.matchedCount === 0)
      return res
        .status(404)
        .send({ status: false, message: "Review Not Exist" });

    // updating number of reviews in book collection
    book = await bookModel.findOneAndUpdate(
      { _id: bookId },
      { $inc: { reviews: -1 } }
    );

    return res.status(200).send({ status: true, message: "Review is deleted" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//---------------------------------------Update review------------------------------------------
const updateReview = async (req, res) => {
  try {
    // validating input request
    if (isValidRequest(req.query) || !isValidRequest(req.body))
      return res.status(400).send({
        status: false,
        message: "Please enter valid input in body",
      });

    let { bookId, reviewId } = req.params;

    // validating bookID
    if (!isValidObjectId(bookId))
      return res.status(400).send({ status: false, message: "Invalid BookId" });
    let book = await bookModel.findOne({ _id: bookId, isDeleted: false });
    if (!book)
      return res
        .status(400)
        .send({ status: false, message: "BookId does not exist" });

    // validating reviewID
    if (!isValidObjectId(reviewId))
      return res
        .status(400)
        .send({ status: false, message: "Invalid reviewId" });

    let { review, rating, reviewedBy } = req.body;
    let body = Object.keys(req.body);
    if (body.length) {
      let output = body.filter((ele) =>
        ["review", "rating", "reviewedBy"].includes(ele)
      );
      if (!output.length)
        return res.status(400).send({
          status: false,
          message: "Please enter valid field in body",
        });
    }
    let updateReviews = {};

    // validating review for updation
    if (review) {
      if (isValid(review))
        updateReviews.review = review
          .split(" ")
          .filter((e) => e)
          .join(" ");
      else
        return res
          .status(400)
          .send({ status: false, message: "Invalid review" });
    }

    // validating rating for updation
    if (rating) {
      if (!(Number(rating) >= 1 && Number(rating) <= 5))
        return res
          .status(400)
          .send({ status: false, message: "Invalid Rating" });
      updateReviews.rating = Math.round(rating * 10) / 10;
    }

    // validating reviewer name for updation
    if (reviewedBy?.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid reviewer name" });
    if (reviewedBy) {
      if (typeof reviewedBy !== "string")
        return res.status(400).send({
          status: false,
          message: "Please enter reviewer Name as string",
        });
      reviewedBy = reviewedBy
        .split(" ")
        .filter((e) => e)
        .join(" ");
      if (isValidName(reviewedBy)) updateReviews.reviewedBy = reviewedBy;
      else
        return res
          .status(400)
          .send({ status: false, message: "Invalid reviewer Name" });
    }

    // updating review in review model
    let updatedReview = await reviewModel
      .findOneAndUpdate(
        { _id: reviewId, bookId: bookId, isDeleted: false },
        updateReviews,
        { new: true }
      )
      .select({ __v: 0, isDeleted: 0 });

    if (!updatedReview)
      return res
        .status(404)
        .send({ status: false, message: "Review not found" });

    book._doc.reviewsData = updatedReview;
    res.status(200).send({ status: true, message: "Success", data: book });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createReview, reviewDeleteById, updateReview };

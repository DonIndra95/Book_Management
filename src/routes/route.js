const express = require("express");
const aws=require("aws-sdk")
const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");
const { createUser, userLogin } = require("../controllers/userController");
const { userAuthentication, authorization } = require("../middlewares/auth");
const {
  createReview,
  reviewDeleteById,
  updateReview,
} = require("../controllers/reviewController");
const router = express.Router();

aws.config.update({
  accessKeyId:"AKIAY3L35MCRVFM24Q7U",
  secretAccessKey:"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",
  region:"ap-south-1"
})

// user API
router.post("/register", createUser);
router.post("/login", userLogin);

// book API
router.post("/books", userAuthentication, createBook);
router.get("/books", userAuthentication, getBooks);
router.get("/books/:bookId", userAuthentication, getBookById);
router.put("/books/:bookId", userAuthentication, authorization, updateBook);
router.delete("/books/:bookId", userAuthentication, authorization, deleteBook);

// REVIEW API
router.post("/books/:bookId/review", createReview);
router.put("/books/:bookId/review/:reviewId", updateReview);
router.delete("/books/:bookId/review/:reviewId", reviewDeleteById);

// validating the route
router.all("/**", function (req, res) {
  res.status(400).send({ status: false, message: "invalid http request" });
});

module.exports = router;

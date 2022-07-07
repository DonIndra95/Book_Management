const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bookModel = require("../models/bookModel");

// Authentication
const userAuthentication = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"] || req.headers["X-API-KEY"];
    // checking token
    if (!token)
      return res
        .status(401)
        .send({ status: false, msg: "token must be present" });

    // validating the token
    jwt.verify(token, "project3group26", function (err, decoded) {
      if (err)
        return res.status(401).send({ status: false, msg: "token is invalid" });
      else {
        // creating an attribute in "req" to access the token outside the middleware
        req.token = decoded;
        next();
      }
    });
  } catch (err) {
    return res.status(500).send({ status: false, msg: err.message });
  }
};

//Authorization
const authorization = async function (req, res, next) {
  try {
    let bookId = req.params.bookId;
    let userLoggedIn = req.token.userId;

    if (!mongoose.Types.ObjectId.isValid(bookId))
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid bookId" });
    // Book validation
    let book = await bookModel.findOne({
      _id: bookId,
      isDeleted: false,
    });
    if (!book) {
      return res
        .status(404)
        .send({ status: false, msg: "No such book exists" });
    }
    // token validation
    if (userLoggedIn != book.userId)
      return res.status(403).send({
        status: false,
        msg: "You are not authorized to perform this task",
      });

    // creating an attribute in "req" to access the blog data outside the middleware
    req.book = book;
    next();
  } catch (err) {
    return res.status(401).send({ status: false, msg: "token is invalid" });
  }
};

module.exports = {
  userAuthentication,
  authorization,
};

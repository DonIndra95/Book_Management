const { isValidObjectId } = require("mongoose");
const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const {
  isValidRequest,
  isValid,
  isValidISBN,
  isValidName,
  convertToArray,
  isValidDate,
} = require("../validator/validations");

// --------------------------------------Create book--------------------------------------
const createBook = async function (req, res) {
  try {
    // Validating request body
    if (!isValidRequest(req.body))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid input" });

    let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } =
      req.body;
    let book = {};

    // title validation
    if (!title)
      return res
        .status(400)
        .send({ status: false, message: "Please enter title" });
    if (!isValid(title))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid title" });
    book.title = title;

    // excerpt validation
    if (!excerpt)
      return res
        .status(400)
        .send({ status: false, message: "Please enter excerpt" });
    if (!isValid(excerpt))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid excerpt" });
    book.excerpt = excerpt;

    // userId validtion
    if (!userId)
      return res
        .status(400)
        .send({ status: false, message: "Please enter userId" });
    if (!isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid userId" });
    if (userId != req.token.userId)
      return res
        .status(400)
        .send({ status: false, message: "You are not authorized" });
    let checkUser = await userModel.findOne({ _id: userId });
    if (!checkUser)
      return res
        .status(400)
        .send({ status: false, message: "User is not present" });
    book.userId = userId;

    // ISBN validation
    if (!ISBN)
      return res
        .status(400)
        .send({ status: false, message: "Please enter ISBN" });
    if (!isValidISBN(ISBN))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid ISBN " });
    let checkISBN = await bookModel.findOne({ ISBN: ISBN });
    if (checkISBN)
      return res
        .status(409)
        .send({ status: false, message: `${ISBN} already exist` });
    book.ISBN = ISBN;

    // category validation
    if (!category)
      return res
        .status(400)
        .send({ status: false, message: "Please enter category" });
    if (!isValidName(category))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid Category" });
    book.category = category;

    // subcategory validation
    if (!subcategory)
      return res
        .status(400)
        .send({ status: false, message: "Please enter subcategory" });
    if (subcategory) {
      let sub = convertToArray(subcategory);
      if (!sub)
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid subcategory" });
      book.subcategory = sub;
    }

    // released date validation
    if (!releasedAt)
      return res
        .status(400)
        .send({ status: false, message: "Please enter release date" });
    if (!isValidDate(releasedAt))
      return res.status(400).send({
        status: false,
        message: "Please enter valid release date in YYYY-MM-DD format",
      });
    book.releasedAt = releasedAt;

    const savedData = await bookModel.create(book);
    res.status(201).send({ status: true, message: "Sucess", data: savedData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// --------------------------------------Get book--------------------------------------
const getBooks = async function (req, res) {
  try {
    // checking for data in body
    if (isValidRequest(req.body))
      return res.status(400).send({
        status: false,
        message: "Please enter valid input in query params",
      });

    // validating input in query params
    if (!isValidRequest(req.query))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid input" });

    let { userId, category, subcategory } = req.query;
    let query = { isDeleted: false };

    if (userId) {
      if (!isValidObjectId(userId))
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid userId" });
      query.userId = userId;
    }

    if (category) {
      if (!isValidName(category))
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid category" });
      query.category = category.trim();
    }

    // checking for subcategory
    if (subcategory) {
      if (subcategory.trim().length) {
        const subArr = subcategory.split(",").map((tag) => tag.trim());
        query.subcategory = { $in: subArr };
      } else
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid subcategory" });
    }

    // serach query on book Model
    const book = await bookModel
      .find(query)
      .select({
        _id: 1,
        title: 1,
        excerpt: 1,
        userId: 1,
        category: 1,
        reviews: 1,
        releasedAt: 1,
      })
      .sort({ title: 1 });
    if (!book.length) {
      return res.status(404).send({ status: false, msg: "no such book exist" });
    }
    return res
      .status(200)
      .send({ status: true, message: "Sucess", data: book });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  createBook,
  getBooks,
};

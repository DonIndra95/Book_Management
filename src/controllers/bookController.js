const mongoose = require("mongoose");
const validator = require("validator");
const ObjectId = mongoose.Types.ObjectId;
const { isValidObjectId } = require("mongoose");
const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const {
  isValidRequest,
  isValid,
  isValidName,
  convertToArray,
  isValidDate,
  changeIsbn10To13,
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
    if (title) {
      title = req.body.title
        .split(" ")
        .filter((word) => word)
        .join(" ");
      let checkTitle = await bookModel.findOne({ title: title });
      if (checkTitle)
        return res
          .status(409)
          .send({ status: false, message: `'${title}' is already taken` });
      book.title = title;
    }

    // excerpt validation
    if (!excerpt)
      return res
        .status(400)
        .send({ status: false, message: "Please enter excerpt" });
    if (!isValid(excerpt))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid excerpt" });
    if (excerpt) {
      excerpt = req.body.excerpt
        .split(" ")
        .filter((word) => word)
        .join(" ");
      book.excerpt = excerpt;
    }

    // userId validtion
    if (!userId)
      return res
        .status(400)
        .send({ status: false, message: "Please enter userId" });
    if (!isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid userId" });
    let checkUser = await userModel.findOne({ _id: userId });
    if (!checkUser)
      return res
        .status(400)
        .send({ status: false, message: "User is not present" });
    if (userId != req.token.userId)
      return res
        .status(400)
        .send({ status: false, message: "You are not authorized" });
    book.userId = userId;

    // ISBN validation
    if (!ISBN)
      return res
        .status(400)
        .send({ status: false, message: "Please enter ISBN" });
    if (!validator.isISBN(ISBN))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid ISBN " });
    ISBN = changeIsbn10To13(ISBN);
    let checkISBN = await bookModel.findOne({ ISBN: ISBN });
    if (checkISBN)
      return res
        .status(409)
        .send({ status: false, message: `ISBN '${ISBN}' already exist` });
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

// --------------------------------------Get book by query params--------------------------------------
const getBooks = async function (req, res) {
  try {
    // checking for data in body
    if (isValidRequest(req.body))
      return res.status(400).send({
        status: false,
        message: "Please enter valid input in query params",
      });

    let { userId, category, subcategory } = req.query;
    let query = {};

    let params = Object.keys(req.query);
    if (params.length) {
      let output = params.filter((ele) =>
        ["userId", "category", "subcategory"].includes(ele)
      );
      if (!output.length)
        return res.status(400).send({
          status: false,
          message: "Please enter valid input in query",
        });
    }

    //console.log(typeof req.query.userId);
    if (userId !== undefined) {
      if (!isValidObjectId(userId))
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid userId" });
      query.userId = userId;
    }

    if (category !== undefined) {
      if (category.trim() === "" || !isValidName(category))
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid category" });
      query.category = category.trim();
    }

    // checking for subcategory
    if (subcategory !== undefined) {
      if (subcategory.trim().length) {
        const subArr = subcategory
          .trim()
          .split(",")
          .map((tag) => tag.trim());
        query.subcategory = { $all: subArr };
      } else
        return res
          .status(400)
          .send({ status: false, msg: "Please enter valid subcategory" });
    }

    query.isDeleted = false;
    console.log(query);

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
      .send({ status: true, message: "Book list", data: book });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// -------------------------------------get book by ID-------------------------------------
const getBookById = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    if (!bookId)
      return res
        .status(400)
        .send({ status: false, msg: "Please enter book ID in params" });

    if (!isValidObjectId(bookId))
      return res
        .status(400)
        .send({ status: false, msg: "Please enter valid book ID" });

    const book = await bookModel.aggregate([
      {
        $match: {
          _id: ObjectId(bookId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "bookId",
          as: "reviewsData",
        },
      },
      {
        $project: {
          ISBN: 0,
          __v: 0,
        },
      },
    ]);

    if (!book)
      return res
        .status(404)
        .send({ status: false, msg: "No sunch book found" });

    res
      .status(200)
      .send({ status: true, message: "Books list", data: book[0] });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// -------------------------------------Update(PUT) book by ID-------------------------------------
const updateBook = async function (req, res) {
  try {
    let bookId = req.book._id;

    if (!isValidRequest(req.body))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid input" });

    let { title, excerpt, ISBN, releasedAt } = req.body;

    let book = {};

    if (title) {
      if (!isValid(title))
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid title" });
      let checkTitle = await bookModel.findOne({ title: title });
      if (checkTitle)
        return res
          .status(400)
          .send({ status: false, message: `'${title}' is already in use` });
      book.title = title;
    }

    if (excerpt) {
      if (!isValid(excerpt))
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid excerpt" });
      book.excerpt = req.body.excerpt
        .split(" ")
        .filter((word) => word)
        .join(" ");
    }

    if (ISBN) {
      if (!validator.isISBN(ISBN))
        return res
          .status(400)
          .send({ status: false, message: "Please enter valid ISBN " });
      ISBN = changeIsbn10To13(ISBN);
      let checkISBN = await bookModel.findOne({ ISBN: ISBN });
      if (checkISBN)
        return res
          .status(409)
          .send({ status: false, message: `ISBN '${ISBN}' already exist` });
      book.ISBN = ISBN;
    }

    if (releasedAt) {
      if (!isValidDate(releasedAt))
        return res.status(400).send({
          status: false,
          message: "Please enter valid release date in YYYY-MM-DD format",
        });
      book.releasedAt = releasedAt;
    }

    let updatedBook = await bookModel.findOneAndUpdate(
      { _id: bookId, isDeleted: false },
      book,
      { new: true }
    );

    if (!updatedBook)
      return res
        .status(404)
        .send({ status: false, message: "Book is not found" });

    res
      .status(200)
      .send({ status: true, message: "Success", data: updatedBook });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

// ---------------------------------------------Delete book by Id---------------------------------------------
const deleteBook = async function (req, res) {
  try {
    let bookId = req.book._id;

    let deletedBook = await bookModel.findOneAndUpdate(
      { _id: bookId, isDeleted: false },
      { isDeleted: true, deletedAt: Date.now() }
    );

    if (!deletedBook)
      return res
        .status(404)
        .send({ status: false, message: "Book is not found" });

    res
      .status(200)
      .send({ status: true, message: "Requested book is deleted" });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
};

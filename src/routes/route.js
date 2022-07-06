const express = require("express");
const { createBook, getBooks } = require("../controllers/bookController");
const { createUser, userLogin } = require("../controllers/userController");
const { userAuthentication } = require("../middlewares/auth");
const router = express.Router();

// user API
router.post("/register", createUser);
router.post("/login", userLogin);

// book API
router.post("/books", userAuthentication, createBook);
router.get("/books", userAuthentication, getBooks);

module.exports = router;

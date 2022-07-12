const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const {
  isValidRequest,
  isValidTitle,
  isValidName,
  isValidMobile,
  isValidMail,
  isValidPassword,
  isValid,
  isValidPincode,
} = require("../validator/validations");

//------------------------------------------Register User------------------------------------------
const createUser = async function (req, res) {
  try {
    // checking for valid input
    if (!isValidRequest(req.body))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid input" });

    const { title, name, phone, email, password, address } = req.body;
    const user = {};

    // validation of title
    if (!title)
      return res
        .status(400)
        .send({ status: false, message: "Title is required" });
    if (!isValidTitle(title))
      return res.status(400).send({
        status: false,
        message: "Please enter title from [Mr, Mrs, Miss]",
      });
    user.title = title;

    // validation of name
    if (!name)
      return res
        .status(400)
        .send({ status: false, message: "User name is required" });
    if (!isValidName(name))
      return res.status(400).send({
        status: false,
        message: "Please enter valid name",
      });
    user.name = name;

    // validating the email ID
    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "Please enter email ID" });
    if (!isValidMail(email))
      return res
        .status(400)
        .send({ status: false, message: "Enter a valid mail ID" });

    // validating mobile number
    if (!phone)
      return res
        .status(400)
        .send({ status: false, message: "Please enter Mobile number" });
    if (!isValidMobile(phone))
      return res.status(400).send({
        status: false,
        message: "Please enter valid Indian mobile Number",
      });

    // password validation
    if (!password)
      return res.status(400).send({
        status: false,
        message: "Password is required",
      });
    if (!isValidPassword(password))
      return res.status(400).send({
        status: false,
        message:
          "Password should contain 8 to 15 characters, one special character, a number and should not contain space",
      });
    user.password = password;

    // validation of address
    if (address) {
      let keys=Object.keys(address)
      if(typeof address !=="object"||keys.length==0) return res.status(400).send({
        status: false,
        message: "Please enter valid address"});
        let output = keys.filter((ele) =>
        ["street", "city", "pincode"].includes(ele)
      );
      if (!output.length)
        return res.status(400).send({
          status: false,
          message: "Please enter valid field in address",
        });
      if (address.street) {
        if (!isValid(address.street))
          return res.status(400).send({
            status: false,
            message: "Please enter valid Street number",
          });
      }

      if (address.city) {
        if (!isValid(address.city))
          return res.status(400).send({
            status: false,
            message: "Please enter valid city name",
          });
      }

      if (address.pincode) {
        if (!isValidPincode(address.pincode))
          return res.status(400).send({
            status: false,
            message: "Please enter valid Pincode",
          });
      }

      user.address = address;
    }

    // checking for the duplicate mail ID and mobile number
    let validate = await userModel.findOne({
      $or: [{ email: email }, { phone: phone }],
    });
    if (validate)
      return res.status(409).send({
        status: false,
        message: "Email ID or Mobile number is already in use",
      });
    else {
      user.email = email;
      user.phone = phone;
    }

    // creating new user
    const savedData = await userModel.create(user);
    res.status(201).send({ status: true, message: "Sucess", data: savedData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//------------------------------------------Login User------------------------------------------
const userLogin = async function (req, res) {
  try {
    // checking for valid input
    if (!isValidRequest(req.body))
      return res
        .status(400)
        .send({ status: false, message: "Please enter emailId and password" });

    let { email, password } = req.body;

    // validating email
    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "Please enter emailId" });

    if (!isValidMail(email))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid emailId " });

    // validating password
    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "Please enter password" });

    if (!isValidPassword(password))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid password" });

    //checking if email and password is correct
    let checkUser = await userModel.findOne({
      email: email,
      password: password,
    });

    if (!checkUser)
      return res.status(404).send({ status: false, message: "User not found" });

    //creating token
    let token = jwt.sign(
      {
        userId: checkUser._id,
      },
      "project3group26",
      { expiresIn: "24h" }
    );
    res.setHeader("x-api-key", token);
    res.status(200).send({ status: true, message: "Sucess", data: token });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  createUser,
  userLogin,
};

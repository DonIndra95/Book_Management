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
    if (!isValidPassword)
      return res.status(400).send({
        status: false,
        message:
          "Password should contain 8 to 15 characters, one special character, a number and should not contain space",
      });
    user.password = password;

    // validation of address
    if (Object.keys(address)) {
      if (!isValid(address.street))
        return res.status(400).send({
          status: false,
          message: "Please enter valid Street number",
        });

      if (!isValid(address.city))
        return res.status(400).send({
          status: false,
          message: "Please enter valid city name",
        });

      if (!isValidPincode(address.pincode))
        return res.status(400).send({
          status: false,
          message: "Please enter valid Pincode",
        });
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

    const savedData = await userModel.create(user);
    res.status(201).send({ status: true, message: "Sucess", data: savedData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  createUser,
};

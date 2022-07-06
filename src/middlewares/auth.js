const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

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

module.exports = {
  userAuthentication,
};

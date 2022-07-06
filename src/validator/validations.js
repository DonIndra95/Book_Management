// function for string verification
const isValid = function (value) {
  if (typeof value == "undefined" || value == null) return false;
  if (typeof value == "string" && value.trim().length == 0) return false;
  else if (typeof value == "string") return true;
};

// function for name
const isValidName = function (name) {
  return /^[a-zA-Z ]{2,30}$/.test(name);
};

// function for input request
const isValidRequest = function (data) {
  if (Object.keys(data).length == 0) return false;
  return true;
};

// function for mail verification
const isValidMail = function (v) {
  return /^([0-9a-z]([-_\\.]*[0-9a-z]+)*)@([a-z]([-_\\.]*[a-z]+)*)[\\.]([a-z]{2,9})+$/.test(
    v
  );
};

// function for mobile verification
const isValidMobile = function (num) {
  return /^[6789]\d{9}$/.test(num);
};

// function for pincode verification
const isValidPincode = function (num) {
  return /^[1-9][0-9]{5}$/.test(num);
};

// function for title verification
const isValidTitle = function (str) {
  return ["Mr", "Mrs", "Miss"].includes(str);
};

// function for password verification
const isValidPassword = function (pass) {
  return /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(pass);
};

module.exports = {
  isValid,
  isValidMail,
  isValidMobile,
  isValidName,
  isValidRequest,
  isValidTitle,
  isValidPassword,
  isValidPincode,
};

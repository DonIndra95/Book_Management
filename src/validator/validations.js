// function for string verification
const isValid = function (value) {
  if (typeof value == "undefined" || value == null) return false;
  if (typeof value == "string" && value.trim().length == 0) return false;
  else if (typeof value == "string") return true;
};

// function for name
const isValidName = function (name) {
  return /^[a-zA-Z .]{2,30}$/.test(name);
};

// function for input request
const isValidRequest = function (data) {
  if (Object.keys(data).length == 0) return false;
  return true;
};

// function for mail verification
const isValidMail = function (v) {
  return /^([0-9a-zA-Z]([-_\\.]*[0-9a-zA-Z]+)*)@([a-z]([-_\\.]*[a-z]+)*)[\\.]([a-z]{2,9})+$/.test(
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

// function for array value verification
const checkValue = function (value) {
  let arrValue = [];
  value.map((x) => {
    if (x.trim().length&&/^[a-zA-Z .,]$/.test(x)) arrValue.push(x);
  });
  return arrValue.length ? arrValue : false;
};

// function for converting string into array
const convertToArray = function (value) {
  if (typeof value === "string" && value ) {
    if (!/^[a-zA-Z .,]$/.test(value)||value.trim().length == 0) return false;
    return value.split(",");
  } else if (value?.length > 0) return checkValue(value);
  return false;
};

// function for validation of date
function isValidDate(dateString) {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false; // Invalid format
  var d = new Date(dateString);
  var dNum = d.getTime();
  console.log(dNum)
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0,10) === dateString;
}

const changeIsbn10To13 = (isbn) => {
  isbn = isbn.replaceAll("-", "");
  if (isbn.length == 13) return isbn;
  let sum = 0;
  let prefix = "978";
  let newIsbn = (prefix + isbn)
    .split("")
    .map((e) => parseInt(e))
    .slice(0, -1);

  newIsbn.forEach((e, i) => {
    if (i % 2 == 0) {
      sum += e * 1;
    } else {
      sum += e * 3;
    }
  });
  newIsbn.push(10 - (sum % 10));
  return newIsbn.join("");
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
  convertToArray,
  isValidDate,
  changeIsbn10To13,
};

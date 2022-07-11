const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    title: { type: String, require: true, enum: ["Mr", "Mrs", "Miss"] },
    name: { type: String, require: true, trim: true },
    phone: { type: String, require: true, unique: true, trim: true },
    email: { type: String, require: true, unique: true, trim: true,lowercase:true},
    password: { type: String, require: true, max: 15, min: 8, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

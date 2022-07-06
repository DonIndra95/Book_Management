const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema({
  bookId: { type: ObjectId, require: true, ref: "book" },
  reviewedBy: { type: String, require: true, default: "Guest" },
  reviewedAt: { type: Date, require: true },
  rating: { type: Number, min: 1, max: 5, require: true },
  review: { type: String },
  isDeleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("Review", reviewSchema);

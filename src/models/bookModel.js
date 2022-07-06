const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, require: true, unique: true, trim: true },
    excerpt: { type: String, require: true, trim: true },
    userId: {
      type: ObjectId,
      require: true,
      ref: "user",
    },
    ISBN: { type: String, require: true, unique: true },
    category: { type: String, require: true, trim: true },
    subcategory: { type: [], require: true },
    reviews: { type: Number, default: 0 },
    deletedAt: { tpye: Date },
    isDeleted: { type: Boolean, default: false },
    releasedAt: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);

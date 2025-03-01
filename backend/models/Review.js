const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Please add a rating"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Please add a comment"],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting more than one review per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  await mongoose.model("Product").findByIdAndUpdate(productId, {
    averageRating: stats.length > 0 ? stats[0].avgRating.toFixed(1) : 0,
    numReviews: stats.length > 0 ? stats[0].numReviews : 0,
  });
};

// Call calcAverageRating after save
reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.product);
});

// Call calcAverageRating before remove
reviewSchema.pre("remove", function () {
  this.constructor.calcAverageRating(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);

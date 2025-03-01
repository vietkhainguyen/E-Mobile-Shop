const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    price: {
      type: Number,
      required: [true, "Please add a product price"],
      default: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please select a category"],
    },
    brand: {
      type: String,
      required: [true, "Please add a brand"],
    },
    stock: {
      type: Number,
      required: [true, "Please add stock quantity"],
      default: 0,
    },
    images: [String],
    mainImage: {
      type: String,
      default: "no-image.jpg",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },
    specifications: {
      type: Object,
      default: {},
    },
    sold: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["available", "outOfStock", "discontinued"],
      default: "available",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate slug from name
productSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = slugify(this.name, { lower: true });
  }

  // Calculate discount percentage
  if (this.originalPrice > 0 && this.price > 0) {
    this.discount = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }

  next();
});

// Virtual field for reviews
productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

module.exports = mongoose.model("Product", productSchema);

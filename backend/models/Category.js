const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a category name"],
      unique: true,
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
    image: {
      type: String,
      default: "no-image.jpg",
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate slug from name
categorySchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Virtual field for subcategories
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
  justOne: false,
});

module.exports = mongoose.model("Category", categorySchema);

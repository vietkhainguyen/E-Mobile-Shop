const Product = require("../models/Product");
const { validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    // Query parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};

    // Search functionality
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: "i" };
    }

    // Category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};

      if (req.query.minPrice) {
        query.price.$gte = Number(req.query.minPrice);
      }

      if (req.query.maxPrice) {
        query.price.$lte = Number(req.query.maxPrice);
      }
    }

    // Brand filter
    if (req.query.brand) {
      query.brand = req.query.brand;
    }

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Featured filter
    if (req.query.featured === "true") {
      query.featured = true;
    }

    // Build sort option
    let sortBy = {};
    if (req.query.sort) {
      switch (req.query.sort) {
        case "newest":
          sortBy = { createdAt: -1 };
          break;
        case "price-low":
          sortBy = { price: 1 };
          break;
        case "price-high":
          sortBy = { price: -1 };
          break;
        case "popular":
          sortBy = { sold: -1 };
          break;
        case "top-rated":
          sortBy = { averageRating: -1 };
          break;
        default:
          sortBy = { createdAt: -1 };
      }
    } else {
      sortBy = { createdAt: -1 };
    }

    // Execute query with pagination
    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort(sortBy)
      .skip(startIndex)
      .limit(limit);

    // Pagination result
    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    };

    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      data: products,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate({
        path: "reviews",
        populate: { path: "user", select: "name" },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
exports.getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category", "name slug")
      .populate({
        path: "reviews",
        populate: { path: "user", select: "name" },
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Process the product data
    const productData = {
      ...req.body,
      specifications: req.body.specifications
        ? JSON.parse(req.body.specifications)
        : {},
    };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map((file) => `/uploads/${file.filename}`);
      productData.mainImage = `/uploads/${req.files[0].filename}`;
    }

    // Create product
    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Process the update data
    const updateData = {
      ...req.body,
      specifications: req.body.specifications
        ? JSON.parse(req.body.specifications)
        : product.specifications,
    };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      // Remove old images from server if new ones are uploaded
      if (product.images && product.images.length > 0) {
        product.images.forEach((image) => {
          const imagePath = path.join(__dirname, "..", image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        });
      }

      updateData.images = req.files.map((file) => `/uploads/${file.filename}`);
      updateData.mainImage = `/uploads/${req.files[0].filename}`;
    }

    // Update product
    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Remove images from server
    if (product.images && product.images.length > 0) {
      product.images.forEach((image) => {
        const imagePath = path.join(__dirname, "..", image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    await product.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect, admin } = require("../middleware/auth");
const {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
});

// Public routes
router.get("/", getProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProduct);

// Admin routes
router.post(
  "/",
  protect,
  admin,
  upload.array("images", 5),
  [
    check("name", "Name is required").not().isEmpty(),
    check("description", "Description is required").not().isEmpty(),
    check("price", "Price is required").isNumeric(),
    check("category", "Category is required").not().isEmpty(),
    check("countInStock", "Count in stock is required").isNumeric(),
    check("brand", "Brand is required").not().isEmpty(),
  ],
  createProduct
);

router.put(
  "/:id",
  protect,
  admin,
  upload.array("images", 5),
  [
    check("name", "Name is required").optional().not().isEmpty(),
    check("description", "Description is required").optional().not().isEmpty(),
    check("price", "Price must be a number").optional().isNumeric(),
    check("category", "Category is required").optional().not().isEmpty(),
    check("countInStock", "Count in stock must be a number")
      .optional()
      .isNumeric(),
    check("brand", "Brand is required").optional().not().isEmpty(),
  ],
  updateProduct
);

router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;

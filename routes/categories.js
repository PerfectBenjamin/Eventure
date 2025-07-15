const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

// Create a new category
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("slug").notEmpty().withMessage("Slug is required"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description max length is 500"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  categoryController.createCategory
);

// Get all categories
router.get(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  categoryController.getAllCategories
);

// Get a single category by ID
router.get(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  categoryController.getCategoryById
);

// Update a category by ID
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("slug").optional().notEmpty().withMessage("Slug cannot be empty"),
    body("description")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Description max length is 500"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  categoryController.updateCategory
);

// Delete a category by ID
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  categoryController.deleteCategory
);

module.exports = router;

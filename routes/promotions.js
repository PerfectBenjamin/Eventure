const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

// Create a new promotion
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  [
    body("code").notEmpty().withMessage("Code is required"),
    body("name").notEmpty().withMessage("Name is required"),
    body("type").notEmpty().withMessage("Type is required"),
    body("value").isNumeric().withMessage("Value must be a number"),
    body("startDate").isISO8601().withMessage("Valid start date is required"),
    body("endDate").isISO8601().withMessage("Valid end date is required"),
    body("metadata.createdBy").notEmpty().withMessage("CreatedBy is required"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  promotionController.createPromotion
);

// Get all promotions
router.get(
  "/",
  authenticateJWT,
  authorizeRoles("admin"),
  promotionController.getAllPromotions
);

// Get a single promotion by ID
router.get(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  promotionController.getPromotionById
);

// Update a promotion by ID
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  [
    body("code").optional().notEmpty().withMessage("Code cannot be empty"),
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("type").optional().notEmpty().withMessage("Type cannot be empty"),
    body("value").optional().isNumeric().withMessage("Value must be a number"),
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be valid"),
    body("endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be valid"),
    body("metadata.createdBy")
      .optional()
      .notEmpty()
      .withMessage("CreatedBy cannot be empty"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  promotionController.updatePromotion
);

// Delete a promotion by ID
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("admin"),
  promotionController.deletePromotion
);

module.exports = router;

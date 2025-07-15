const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authenticateJWT } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

// Create a new notification
router.post(
  "/",
  authenticateJWT,
  [
    body("user").notEmpty().withMessage("User ID is required"),
    body("type").notEmpty().withMessage("Type is required"),
    body("title").notEmpty().withMessage("Title is required"),
    body("message").notEmpty().withMessage("Message is required"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  notificationController.createNotification
);

// Get all notifications
router.get("/", authenticateJWT, notificationController.getAllNotifications);

// Get a single notification by ID
router.get("/:id", authenticateJWT, notificationController.getNotificationById);

// Update a notification by ID
router.put(
  "/:id",
  authenticateJWT,
  [
    body("user").optional().notEmpty().withMessage("User ID cannot be empty"),
    body("type").optional().notEmpty().withMessage("Type cannot be empty"),
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("message")
      .optional()
      .notEmpty()
      .withMessage("Message cannot be empty"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  notificationController.updateNotification
);

// Delete a notification by ID
router.delete(
  "/:id",
  authenticateJWT,
  notificationController.deleteNotification
);

module.exports = router;

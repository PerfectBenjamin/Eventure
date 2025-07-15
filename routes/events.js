const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { authenticateJWT, authorizeRoles } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "eventure-events",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});
const upload = multer({ storage });
// Serve event image from database
const Event = require("../models/Event");
router.get("/:id/image", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.imageData || !event.imageData.data) {
      return res.status(404).send("No image found");
    }
    res.set("Content-Type", event.imageData.contentType);
    res.send(Buffer.from(event.imageData.data));
  } catch (err) {
    res.status(500).send("Error retrieving image");
  }
});

// Create a new event (only organizer or admin)
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("organizer", "admin"),
  upload.single("image"), // Use single for one image
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("date.startDate")
      .isISO8601()
      .withMessage("Valid start date is required"),
    body("date.endDate").isISO8601().withMessage("Valid end date is required"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  eventController.createEvent
);

// Get all events
router.get("/", eventController.getAllEvents);

// Get a single event by ID
router.get("/:id", eventController.getEventById);

// Update an event by ID
router.put(
  "/:id",
  [
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("category")
      .optional()
      .notEmpty()
      .withMessage("Category cannot be empty"),
    body("date.startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be valid"),
    body("date.endDate")
      .optional()
      .isISO8601()
      .withMessage("End date must be valid"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  eventController.updateEvent
);

// Delete an event by ID
router.delete("/:id", eventController.deleteEvent);

module.exports = router;

const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { authenticateJWT } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

// Create a new ticket
router.post(
  "/",
  authenticateJWT,
  [
    body("event").notEmpty().withMessage("Event ID is required"),
    body("user").notEmpty().withMessage("User ID is required"),
    body("ticketNumber").notEmpty().withMessage("Ticket number is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("paymentMethod").notEmpty().withMessage("Payment method is required"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  ticketController.createTicket
);

// POST /api/tickets/free - Issue a free ticket for a free event
router.post("/free", authenticateJWT, async (req, res) => {
  const { eventId } = req.body;
  const userId = req.user._id || req.user.id;
  const Event = require("../models/Event");
  const Ticket = require("../models/Ticket");
  try {
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (!event.price || event.price.amount > 0)
      return res.status(400).json({ error: "Event is not free" });

    // Check if user already has a ticket for this event
    const existing = await Ticket.findOne({ event: eventId, user: userId });
    if (existing)
      return res
        .status(400)
        .json({ error: "You already have a ticket for this event" });

    const ticket = new Ticket({
      event: eventId,
      user: userId,
      ticketType: "regular",
      quantity: 1,
      price: { amount: 0, currency: event.price.currency || "NGN" },
      totalPrice: { amount: 0, currency: event.price.currency || "NGN" },
      status: "confirmed",
      paymentMethod: "other",
      purchaseSource: "web",
    });
    // Fallback: set ticketNumber if not set (shouldn't be needed, but ensures it works)
    if (!ticket.ticketNumber) {
      ticket.ticketNumber =
        "TICK-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    }
    await ticket.save();
    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tickets/validate - Validate and check in a ticket by QR code
const Event = require("../models/Event");
const Ticket = require("../models/Ticket");
router.post("/validate", authenticateJWT, async (req, res) => {
  const { code } = req.body;
  const userId = req.user._id || req.user.id;
  try {
    const ticket = await Ticket.findOne({ ticketCode: code })
      .populate("event")
      .populate("user");
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (!ticket.event)
      return res.status(404).json({ error: "Event not found for this ticket" });
    const organizerId = ticket.event.organizer._id || ticket.event.organizer;
    if (String(organizerId) !== String(userId)) {
      return res
        .status(403)
        .json({ error: "You are not the organizer for this event" });
    }
    // Check that the ticket is for the selected event
    if (String(ticket.event._id) !== String(req.body.eventId)) {
      return res
        .status(400)
        .json({ error: "This ticket is not for the selected event" });
    }
    const wasCheckedIn = ticket.checkedIn;
    if (!wasCheckedIn) {
      ticket.checkedIn = true;
      ticket.checkInTime = new Date();
      await ticket.save();
    }
    res.json({ success: true, ticket, wasCheckedIn });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tickets
router.get("/", authenticateJWT, ticketController.getAllTickets);

// Get a single ticket by ID
router.get("/:id", authenticateJWT, ticketController.getTicketById);

// Update a ticket by ID
router.put(
  "/:id",
  authenticateJWT,
  [
    body("event").optional().notEmpty().withMessage("Event ID cannot be empty"),
    body("user").optional().notEmpty().withMessage("User ID cannot be empty"),
    body("ticketNumber")
      .optional()
      .notEmpty()
      .withMessage("Ticket number cannot be empty"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
    body("paymentMethod")
      .optional()
      .notEmpty()
      .withMessage("Payment method cannot be empty"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  ticketController.updateTicket
);

// Delete a ticket by ID
router.delete("/:id", authenticateJWT, ticketController.deleteTicket);

module.exports = router;

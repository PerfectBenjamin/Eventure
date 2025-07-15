const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { authenticateJWT } = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const axios = require("axios");

// Create a new payment
router.post(
  "/",
  authenticateJWT,
  [
    body("user").notEmpty().withMessage("User ID is required"),
    body("ticket").notEmpty().withMessage("Ticket ID is required"),
    body("event").notEmpty().withMessage("Event ID is required"),
    body("amount").isNumeric().withMessage("Amount must be a number"),
    body("paymentMethod.type")
      .notEmpty()
      .withMessage("Payment method type is required"),
    body("gateway.name").notEmpty().withMessage("Gateway name is required"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  paymentController.createPayment
);

// Get all payments
router.get("/", authenticateJWT, paymentController.getAllPayments);

// Get a single payment by ID
router.get("/:id", authenticateJWT, paymentController.getPaymentById);

// Update a payment by ID
router.put(
  "/:id",
  authenticateJWT,
  [
    body("user").optional().notEmpty().withMessage("User ID cannot be empty"),
    body("ticket")
      .optional()
      .notEmpty()
      .withMessage("Ticket ID cannot be empty"),
    body("event").optional().notEmpty().withMessage("Event ID cannot be empty"),
    body("amount")
      .optional()
      .isNumeric()
      .withMessage("Amount must be a number"),
    body("paymentMethod.type")
      .optional()
      .notEmpty()
      .withMessage("Payment method type cannot be empty"),
    body("gateway.name")
      .optional()
      .notEmpty()
      .withMessage("Gateway name cannot be empty"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  paymentController.updatePayment
);

// Delete a payment by ID
router.delete("/:id", authenticateJWT, paymentController.deletePayment);

// Payment verification (Paystack)
router.post("/verify", authenticateJWT, async (req, res) => {
  const { reference, eventId, ticketType = "regular", quantity = 1 } = req.body;
  const userId = req.user._id || req.user.id;
  try {
    // 1. Verify with Paystack
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );
    const data = paystackRes.data.data;
    if (data.status !== "success") {
      return res.status(400).json({ error: "Payment not successful" });
    }
    // 2. Create Ticket (do not set ticketNumber, let pre-save hook handle it)
    const Ticket = require("../models/Ticket");
    const ticket = new Ticket({
      event: eventId,
      user: userId,
      ticketType,
      quantity,
      price: { amount: data.amount / 100, currency: data.currency },
      totalPrice: { amount: data.amount / 100, currency: data.currency },
      status: "confirmed",
      paymentMethod: "credit_card",
      paymentId: data.reference,
      purchaseSource: "web",
    });
    // Fallback: set ticketNumber if not set (shouldn't be needed, but ensures it works)
    if (!ticket.ticketNumber) {
      ticket.ticketNumber =
        "TICK-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    }
    await ticket.save();
    // 3. Record Payment
    const Payment = require("../models/Payment");
    const payment = new Payment({
      user: userId,
      ticket: ticket._id,
      event: eventId,
      amount: data.amount / 100,
      currency: data.currency,
      status: "completed",
      paymentMethod: { type: "credit_card" },
      transactionId: data.reference,
      gateway: { name: "other", transactionId: data.reference },
    });
    await payment.save();
    res.json({ success: true, ticket, payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

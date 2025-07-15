const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  // Payment details
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "NGN",
  },
  // Payment status
  status: {
    type: String,
    enum: [
      "pending",
      "processing",
      "completed",
      "failed",
      "refunded",
      "partially_refunded",
      "cancelled",
    ],
    default: "pending",
  },
  // Payment method
  paymentMethod: {
    type: {
      type: String,
      enum: ["credit_card", "debit_card", "paypal", "bank_transfer", "other"],
      required: true,
    },
    details: {
      // For credit/debit cards
      cardType: String,
      last4Digits: String,
      // For PayPal
      paypalEmail: String,
      // For bank transfer
      bankName: String,
      accountLast4: String,
    },
  },
  // Transaction details
  transactionId: {
    type: String,
    unique: true,
  },
  // For payment gateway
  gateway: {
    name: {
      type: String,
      enum: ["stripe", "paypal", "square", "other"],
      required: true,
    },
    transactionId: String,
    responseCode: String,
    responseMessage: String,
  },
  // For refunds
  refund: {
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    processedAt: Date,
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  // For payment metadata
  metadata: {
    taxAmount: Number,
    discountAmount: Number,
    processingFee: Number,
    currencyConversionRate: Number,
    originalCurrency: String,
    originalAmount: Number,
  },
  // For payment tracking
  ipAddress: String,
  userAgent: String,
  // For payment history
  history: [
    {
      status: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      note: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
PaymentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for efficient querying
PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ transactionId: 1 }, { unique: true });
PaymentSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", PaymentSchema);

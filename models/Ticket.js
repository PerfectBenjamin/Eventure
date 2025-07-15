const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ticketType: {
    type: String,
    enum: ["regular", "vip", "early-bird"],
    default: "regular",
  },
  ticketNumber: {
    type: String,
    unique: true,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    amount: Number,
    currency: {
      type: String,
      default: "NGN",
    },
  },
  totalPrice: {
    amount: Number,
    currency: {
      type: String,
      default: "NGN",
    },
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "refunded", "used"],
    default: "pending",
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
  validFrom: Date,
  validUntil: Date,
  isTransferable: {
    type: Boolean,
    default: false,
  },
  transferHistory: [
    {
      fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      transferDate: Date,
    },
  ],
  ticketCode: {
    type: String,
    unique: true,
  },
  checkedIn: {
    type: Boolean,
    default: false,
  },
  checkInTime: Date,
  refundStatus: {
    type: String,
    enum: ["none", "requested", "approved", "rejected", "completed"],
    default: "none",
  },
  refundAmount: Number,
  refundDate: Date,
  paymentMethod: {
    type: String,
    enum: ["credit_card", "debit_card", "paypal", "bank_transfer", "other"],
    required: true,
  },
  paymentId: String,
  purchaseSource: {
    type: String,
    enum: ["web", "mobile", "box_office", "other"],
    default: "web",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

TicketSchema.pre("save", function (next) {
  if (!this.ticketNumber) {
    this.ticketNumber =
      "TICK-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
  }
  if (!this.ticketCode) {
    this.ticketCode =
      "TCODE-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6);
  }
  this.updatedAt = Date.now();
  next();
});

module.exports =
  mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);

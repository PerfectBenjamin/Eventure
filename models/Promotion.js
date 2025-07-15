const mongoose = require("mongoose");

const PromotionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  // Promotion type
  type: {
    type: String,
    enum: ["percentage", "fixed_amount", "free_ticket", "buy_one_get_one"],
    required: true,
  },
  // Discount value
  value: {
    type: Number,
    required: true,
  },
  // For percentage discounts
  maxDiscount: Number,
  // For fixed amount discounts
  minPurchase: Number,
  // Validity period
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  // Usage limits
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  // Per user usage limit
  perUserLimit: {
    type: Number,
    default: 1,
  },
  // Applicable events
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  // Applicable categories
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  // Promotion status
  status: {
    type: String,
    enum: ["active", "inactive", "expired", "cancelled"],
    default: "active",
  },
  // Promotion conditions
  conditions: {
    minTickets: Number,
    maxTickets: Number,
    userRoles: [
      {
        type: String,
        enum: ["attendee", "organizer", "admin"],
      },
    ],
    firstTimeUser: Boolean,
    specificUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  // Promotion metadata
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    termsAndConditions: String,
    image: String,
  },
  // For tracking usage
  usageHistory: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
      ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
      },
      usedAt: {
        type: Date,
        default: Date.now,
      },
      discountApplied: Number,
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
PromotionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  // Check if promotion has expired
  if (this.endDate < new Date()) {
    this.status = "expired";
  }
  next();
});

// Create indexes for efficient querying
PromotionSchema.index({ code: 1 }, { unique: true });
PromotionSchema.index({ status: 1, startDate: 1, endDate: 1 });
PromotionSchema.index({ "usageHistory.user": 1, "usageHistory.event": 1 });

module.exports = mongoose.model("Promotion", PromotionSchema);

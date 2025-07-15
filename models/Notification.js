const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: [
      "event_reminder",
      "ticket_purchased",
      "ticket_cancelled",
      "event_updated",
      "event_cancelled",
      "review_received",
      "review_replied",
      "payment_received",
      "payment_failed",
      "promotion_available",
      "system_announcement",
    ],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  // For linking to related entities
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
  relatedTicket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ticket",
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // For notification status
  status: {
    type: String,
    enum: ["unread", "read", "archived"],
    default: "unread",
  },
  // For notification priority
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  // For notification delivery
  delivery: {
    email: {
      sent: {
        type: Boolean,
        default: false,
      },
      sentAt: Date,
    },
    push: {
      sent: {
        type: Boolean,
        default: false,
      },
      sentAt: Date,
    },
    inApp: {
      sent: {
        type: Boolean,
        default: true,
      },
      sentAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  // For notification metadata
  metadata: {
    actionUrl: String,
    actionText: String,
    imageUrl: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // For notification expiration
  expiresAt: Date,
});

// Update the updatedAt timestamp before saving
NotificationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for efficient querying
NotificationSchema.index({ user: 1, status: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Notification", NotificationSchema);

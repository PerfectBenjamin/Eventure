const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: String, // URL for event image
  images: [String], // Multiple images for the event
  category: {
    type: String,
    required: true,
    enum: [
      "Music",
      "Sports",
      "Technology",
      "Food",
      "Arts",
      "Business",
      "Other",
      "Charity",
      "Education",
      "Entertainment",
      "Networking",
    ],
  },
  subCategory: String,
  tags: [String],
  location: {
    venue: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  date: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    timezone: String,
  },
  price: {
    amount: Number,
    currency: {
      type: String,
      default: "NGN",
    },
    earlyBirdPrice: Number,
    earlyBirdEndDate: Date,
    vipPrice: Number,
  },
  availableTickets: {
    total: Number,
    sold: {
      type: Number,
      default: 0,
    },
    reserved: {
      type: Number,
      default: 0,
    },
  },
  status: {
    type: String,
    enum: ["draft", "published", "cancelled", "completed"],
    default: "draft",
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  capacity: Number,
  ageRestriction: {
    minimumAge: Number,
    maximumAge: Number,
  },
  requirements: [String],
  schedule: [
    {
      time: Date,
      activity: String,
      description: String,
    },
  ],
  socialLinks: {
    website: String,
    facebook: String,
    twitter: String,
    instagram: String,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  cancellationPolicy: String,
  refundPolicy: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

EventSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Event", EventSchema);

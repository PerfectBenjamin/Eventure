const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    maxLength: 500,
  },
  // For category hierarchy
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  // For category image/icon
  image: {
    type: String,
    default: "",
  },
  // For category status
  isActive: {
    type: Boolean,
    default: true,
  },
  // For category ordering
  order: {
    type: Number,
    default: 0,
  },
  // For category metadata
  metadata: {
    keywords: [String],
    seoDescription: String,
  },
  // For category statistics
  stats: {
    eventCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
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

// Update the updatedAt timestamp before saving
CategorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  // Generate slug from name if not provided
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }
  next();
});

// Create text index for search
CategorySchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Category", CategorySchema);
